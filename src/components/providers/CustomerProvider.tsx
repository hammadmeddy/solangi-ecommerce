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
  CUSTOMER_STORAGE,
  DEFAULT_ADDRESSES,
  type CustomerAddress,
  type WishlistItem,
} from "@/lib/customer";
import type { PlacedOrder } from "@/lib/cart";
import type { AuthUser } from "@/lib/auth";
import { apiGet, apiSend } from "@/lib/api-client";
import { useAuth } from "./AuthProvider";

type ProfileInput = { name: string; email: string; city: string };

type CustomerContextValue = {
  ready: boolean;
  email: string;
  city: string;
  /** Saves name/email/city to the account. Throws on failure. */
  saveProfile: (input: ProfileInput) => Promise<void>;
  addresses: CustomerAddress[];
  saveAddress: (address: CustomerAddress) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  orders: PlacedOrder[];
  refreshOrders: () => Promise<void>;
  /** Cancels an order that is still "placed". Throws with the server's reason. */
  cancelOrder: (orderId: string) => Promise<void>;
  wishlist: WishlistItem[];
  toggleWishlist: (item: Omit<WishlistItem, "addedAt">) => void;
  removeWishlist: (productId: string) => void;
};

const CustomerContext = createContext<CustomerContextValue | null>(null);

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useAuth();
  const [ready, setReady] = useState(false);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const userId = user?.id;

  useEffect(() => {
    let cancelled = false;
    try {
      // Profile used to live in the browser; it is on the account now.
      localStorage.removeItem(CUSTOMER_STORAGE.profileExtra);
    } catch {
      /* ignore */
    }

    if (!userId) {
      setAddresses(readJson<CustomerAddress[]>(CUSTOMER_STORAGE.addresses, DEFAULT_ADDRESSES));
      setWishlist(readJson<WishlistItem[]>(CUSTOMER_STORAGE.wishlist, []));
      setOrders([]);
      setReady(true);
      return;
    }

    setReady(false);
    void (async () => {
      const [addressRes, wishRes, orderRes] = await Promise.allSettled([
        apiGet<{ addresses: CustomerAddress[] }>("/api/account/addresses"),
        apiGet<{ wishlist: WishlistItem[] }>("/api/account/wishlist"),
        apiGet<{ orders: PlacedOrder[] }>("/api/orders"),
      ]);
      if (cancelled) return;
      setAddresses(addressRes.status === "fulfilled" ? addressRes.value.addresses || [] : []);
      setWishlist(wishRes.status === "fulfilled" ? wishRes.value.wishlist || [] : []);
      setOrders(orderRes.status === "fulfilled" ? orderRes.value.orders || [] : []);
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const saveProfile = useCallback(
    async (input: ProfileInput) => {
      const res = await apiSend<{ user: AuthUser }>("PATCH", "/api/account/profile", input);
      updateUser({ name: res.user.name, email: res.user.email, city: res.user.city });
    },
    [updateUser],
  );

  const refreshOrders = useCallback(async () => {
    if (!userId) return;
    const res = await apiGet<{ orders: PlacedOrder[] }>("/api/orders");
    setOrders(res.orders || []);
  }, [userId]);

  const cancelOrder = useCallback(async (orderId: string) => {
    const res = await apiSend<{ order: PlacedOrder }>(
      "PATCH",
      `/api/orders/${encodeURIComponent(orderId)}`,
      { status: "cancelled" },
    );
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...res.order } : o)));
  }, []);

  const saveAddress = useCallback(
    async (address: CustomerAddress) => {
      if (!userId) {
        setAddresses((prev) => {
          const exists = prev.some((a) => a.id === address.id);
          let next = exists ? prev.map((a) => (a.id === address.id ? address : a)) : [...prev, address];
          if (address.isDefault) next = next.map((a) => ({ ...a, isDefault: a.id === address.id }));
          writeJson(CUSTOMER_STORAGE.addresses, next);
          return next;
        });
        return;
      }

      const isNew = address.id.startsWith("local-") || address.id.startsWith("addr-");
      const res = await apiSend<{ address: CustomerAddress }>("POST", "/api/account/addresses", {
        ...address,
        id: isNew ? undefined : address.id,
      });
      setAddresses((prev) => {
        const without = prev.filter((a) => a.id !== address.id && a.id !== res.address.id);
        const next = [...without, res.address];
        return res.address.isDefault
          ? next.map((a) => ({ ...a, isDefault: a.id === res.address.id }))
          : next;
      });
    },
    [userId],
  );

  const removeAddress = useCallback(
    async (id: string) => {
      const before = addresses;
      const next = addresses.filter((a) => a.id !== id);
      setAddresses(next);
      if (!userId) {
        writeJson(CUSTOMER_STORAGE.addresses, next);
        return;
      }
      try {
        await apiSend("DELETE", `/api/account/addresses?id=${encodeURIComponent(id)}`);
      } catch (err) {
        setAddresses(before);
        throw err;
      }
    },
    [userId, addresses],
  );

  const toggleWishlist = useCallback(
    (item: Omit<WishlistItem, "addedAt">) => {
      const before = wishlist;
      const exists = wishlist.some((w) => w.productId === item.productId);
      const next = exists
        ? wishlist.filter((w) => w.productId !== item.productId)
        : [...wishlist, { ...item, addedAt: new Date().toISOString().slice(0, 10) }];
      setWishlist(next);
      if (!userId) {
        writeJson(CUSTOMER_STORAGE.wishlist, next);
        return;
      }
      void apiSend("POST", "/api/account/wishlist", item).catch(() => setWishlist(before));
    },
    [userId, wishlist],
  );

  const removeWishlist = useCallback(
    (productId: string) => {
      const before = wishlist;
      const next = wishlist.filter((w) => w.productId !== productId);
      setWishlist(next);
      if (!userId) {
        writeJson(CUSTOMER_STORAGE.wishlist, next);
        return;
      }
      void apiSend("DELETE", `/api/account/wishlist?productId=${encodeURIComponent(productId)}`).catch(() =>
        setWishlist(before),
      );
    },
    [userId, wishlist],
  );

  const value = useMemo(
    () => ({
      ready,
      email: user?.email ?? "",
      city: user?.city ?? "",
      saveProfile,
      addresses,
      saveAddress,
      removeAddress,
      orders,
      refreshOrders,
      cancelOrder,
      wishlist,
      toggleWishlist,
      removeWishlist,
    }),
    [
      ready,
      user?.email,
      user?.city,
      saveProfile,
      addresses,
      saveAddress,
      removeAddress,
      orders,
      refreshOrders,
      cancelOrder,
      wishlist,
      toggleWishlist,
      removeWishlist,
    ],
  );

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error("useCustomer must be used within CustomerProvider");
  return ctx;
}
