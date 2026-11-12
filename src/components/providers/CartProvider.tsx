"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CART_STORAGE_KEY,
  PLACED_ORDERS_KEY,
  cartCount,
  cartSubtotal,
  type CartLine,
  type PlacedOrder,
} from "@/lib/cart";
import type { DemoProduct } from "@/lib/products";
import { apiGet, apiPost, apiSend } from "@/lib/api-client";
import { useAuth } from "./AuthProvider";

type CartContextValue = {
  ready: boolean;
  lines: CartLine[];
  count: number;
  subtotalPkr: number;
  addProduct: (product: DemoProduct, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  removeLine: (productId: string) => void;
  clearCart: () => void;
  placedOrders: PlacedOrder[];
  placeOrder: (input: {
    addressLabel: string;
    summary: string;
  }) => Promise<PlacedOrder>;
  refreshOrders: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function mergeLines(a: CartLine[], b: CartLine[]): CartLine[] {
  const map = new Map<string, CartLine>();
  for (const line of [...a, ...b]) {
    const prev = map.get(line.productId);
    if (!prev) {
      map.set(line.productId, { ...line });
      continue;
    }
    map.set(line.productId, { ...prev, qty: prev.qty + line.qty });
  }
  return [...map.values()];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const [ready, setReady] = useState(false);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [placedOrders, setPlacedOrders] = useState<PlacedOrder[]>([]);
  const syncing = useRef(false);
  const userId = user?.id ?? user?.phone ?? null;

  const persistLocal = useCallback((next: CartLine[]) => {
    setLines(next);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const pushServer = useCallback(async (next: CartLine[]) => {
    if (!userId) return;
    try {
      await apiSend("PUT", "/api/cart", { lines: next });
    } catch {
      /* keep local cart if API down */
    }
  }, [userId]);

  const refreshOrders = useCallback(async () => {
    if (!userId) {
      setPlacedOrders(readJson<PlacedOrder[]>(PLACED_ORDERS_KEY, []));
      return;
    }
    try {
      const data = await apiGet<{ orders: PlacedOrder[] }>("/api/orders");
      setPlacedOrders(data.orders || []);
      try {
        localStorage.setItem(PLACED_ORDERS_KEY, JSON.stringify(data.orders || []));
      } catch {
        /* ignore */
      }
    } catch {
      setPlacedOrders(readJson<PlacedOrder[]>(PLACED_ORDERS_KEY, []));
    }
  }, [userId]);

  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;

    (async () => {
      const localLines = readJson<CartLine[]>(CART_STORAGE_KEY, []);
      if (!userId) {
        if (!cancelled) {
          setLines(localLines);
          setPlacedOrders(readJson<PlacedOrder[]>(PLACED_ORDERS_KEY, []));
          setReady(true);
        }
        return;
      }

      try {
        const data = await apiGet<{ lines: CartLine[] }>("/api/cart");
        const merged = mergeLines(localLines, data.lines || []);
        if (cancelled) return;
        persistLocal(merged);
        if (JSON.stringify(merged) !== JSON.stringify(data.lines || [])) {
          await pushServer(merged);
        }
      } catch {
        if (!cancelled) persistLocal(localLines);
      }

      if (!cancelled) {
        await refreshOrders();
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authReady, userId, persistLocal, pushServer, refreshOrders]);

  const applyLines = useCallback(
    (updater: (prev: CartLine[]) => CartLine[]) => {
      setLines((prev) => {
        const next = updater(prev);
        try {
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        if (userId && !syncing.current) {
          syncing.current = true;
          void pushServer(next).finally(() => {
            syncing.current = false;
          });
        }
        return next;
      });
    },
    [pushServer, userId],
  );

  const addProduct = useCallback(
    (product: DemoProduct, qty = 1) => {
      applyLines((prev) => {
        const existing = prev.find((l) => l.productId === product.id);
        if (existing) {
          return prev.map((l) =>
            l.productId === product.id ? { ...l, qty: l.qty + qty } : l,
          );
        }
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            category: product.category,
            categoryId: product.categoryId,
            pricePkr: product.pricePkr,
            qty,
          },
        ];
      });
    },
    [applyLines],
  );

  const setQty = useCallback(
    (productId: string, qty: number) => {
      const nextQty = Math.max(0, Math.floor(qty));
      applyLines((prev) =>
        nextQty === 0
          ? prev.filter((l) => l.productId !== productId)
          : prev.map((l) => (l.productId === productId ? { ...l, qty: nextQty } : l)),
      );
    },
    [applyLines],
  );

  const removeLine = useCallback(
    (productId: string) => {
      applyLines((prev) => prev.filter((l) => l.productId !== productId));
    },
    [applyLines],
  );

  const clearCart = useCallback(() => {
    persistLocal([]);
    if (userId) {
      void apiSend("DELETE", "/api/cart").catch(() => undefined);
    }
  }, [persistLocal, userId]);

  const placeOrder = useCallback(
    async (input: { addressLabel: string; summary: string }) => {
      const snapshot = [...lines];
      const totalPkr = cartSubtotal(snapshot);
      const itemCount = cartCount(snapshot);
      let order: PlacedOrder = {
        id: `SE-${10000 + Math.floor(Math.random() * 8000)}`,
        placedAt: new Date().toISOString().slice(0, 10),
        status: "placed",
        totalPkr,
        itemCount,
        summary: input.summary,
        payment: "COD",
        addressLabel: input.addressLabel,
      };

      try {
        const res = await apiPost<{ order: PlacedOrder }>("/api/orders", {
          addressLabel: input.addressLabel,
          summary: input.summary,
          totalPkr,
          itemCount,
          lines: snapshot.map((l) => ({
            productId: l.productId,
            name: l.name,
            qty: l.qty,
            pricePkr: l.pricePkr,
          })),
        });
        order = res.order;
      } catch {
        /* keep local order if API unavailable */
      }

      setPlacedOrders((prev) => {
        const next = [order, ...prev.filter((o) => o.id !== order.id)];
        try {
          localStorage.setItem(PLACED_ORDERS_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
      persistLocal([]);
      return order;
    },
    [lines, persistLocal],
  );

  const value = useMemo(
    () => ({
      ready,
      lines,
      count: cartCount(lines),
      subtotalPkr: cartSubtotal(lines),
      addProduct,
      setQty,
      removeLine,
      clearCart,
      placedOrders,
      placeOrder,
      refreshOrders,
    }),
    [
      ready,
      lines,
      addProduct,
      setQty,
      removeLine,
      clearCart,
      placedOrders,
      placeOrder,
      refreshOrders,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
