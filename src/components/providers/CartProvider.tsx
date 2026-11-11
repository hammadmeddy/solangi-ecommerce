"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
import { apiPost } from "@/lib/api-client";

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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [placedOrders, setPlacedOrders] = useState<PlacedOrder[]>([]);

  useEffect(() => {
    setLines(readJson<CartLine[]>(CART_STORAGE_KEY, []));
    setPlacedOrders(readJson<PlacedOrder[]>(PLACED_ORDERS_KEY, []));
    setReady(true);
  }, []);

  const persistLines = useCallback((next: CartLine[]) => {
    setLines(next);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addProduct = useCallback(
    (product: DemoProduct, qty = 1) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.productId === product.id);
        const next = existing
          ? prev.map((l) =>
              l.productId === product.id ? { ...l, qty: l.qty + qty } : l,
            )
          : [
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
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const setQty = useCallback(
    (productId: string, qty: number) => {
      const nextQty = Math.max(0, Math.floor(qty));
      setLines((prev) => {
        const next =
          nextQty === 0
            ? prev.filter((l) => l.productId !== productId)
            : prev.map((l) => (l.productId === productId ? { ...l, qty: nextQty } : l));
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const removeLine = useCallback((productId: string) => {
    setLines((prev) => {
      const next = prev.filter((l) => l.productId !== productId);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearCart = useCallback(() => persistLines([]), [persistLines]);

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
        const next = [order, ...prev];
        localStorage.setItem(PLACED_ORDERS_KEY, JSON.stringify(next));
        return next;
      });
      persistLines([]);
      return order;
    },
    [lines, persistLines],
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
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
