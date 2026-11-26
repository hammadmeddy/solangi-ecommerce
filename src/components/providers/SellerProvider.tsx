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
  SELLER_STORAGE,
  defaultStore,
  type SellerApplication,
  type SellerEarnings,
  type SellerListing,
  type SellerOrder,
  type SellerStore,
} from "@/lib/seller";
import { apiGet, apiSend } from "@/lib/api-client";
import { useAuth } from "./AuthProvider";

export type ListingInput = {
  id?: string;
  name: string;
  categoryId: string;
  pricePkr: number;
  stock: number;
  description: string;
  draft: boolean;
  imageDataUrl?: string;
};

export type ApplicationInput = {
  name: string;
  city: string;
  phone: string;
  cnic: string;
  bio: string;
};

type SellerContextValue = {
  ready: boolean;
  /** Set for customers who applied (or were rejected / suspended) */
  application: SellerApplication | null;
  apply: (input: ApplicationInput) => Promise<void>;
  store: SellerStore;
  saveStore: (store: SellerStore) => Promise<void>;
  listings: SellerListing[];
  saveListing: (input: ListingInput) => Promise<SellerListing>;
  removeListing: (id: string) => Promise<void>;
  orders: SellerOrder[];
  advanceOrder: (orderId: string, status: "packed" | "shipped") => Promise<void>;
  earnings: SellerEarnings | null;
  refresh: () => Promise<void>;
};

const SellerContext = createContext<SellerContextValue | null>(null);

export function SellerProvider({ children }: { children: React.ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const [ready, setReady] = useState(false);
  const [application, setApplication] = useState<SellerApplication | null>(null);
  const [store, setStore] = useState<SellerStore>(defaultStore("", "Seller"));
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [earnings, setEarnings] = useState<SellerEarnings | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setApplication(null);
      setReady(true);
      return;
    }
    if (user.role !== "seller") {
      try {
        const res = await apiGet<{ application: SellerApplication | null }>("/api/seller/apply");
        setApplication(res.application);
      } catch {
        setApplication(null);
      }
      setStore(defaultStore(user.phone, user.name));
      setListings([]);
      setOrders([]);
      setEarnings(null);
      setReady(true);
      return;
    }

    try {
      const [storeRes, listRes, orderRes, earnRes] = await Promise.all([
        apiGet<{ store: SellerStore }>("/api/seller/store"),
        apiGet<{ listings: SellerListing[] }>("/api/seller/listings"),
        apiGet<{ orders: SellerOrder[] }>("/api/seller/orders"),
        apiGet<{ earnings: SellerEarnings }>("/api/seller/earnings"),
      ]);
      setApplication(null);
      setStore(storeRes.store);
      setListings(listRes.listings);
      setOrders(orderRes.orders);
      setEarnings(earnRes.earnings);
    } catch {
      setStore(defaultStore(user.phone, user.name));
      setListings([]);
      setOrders([]);
      setEarnings(null);
    } finally {
      setReady(true);
    }
  }, [user]);

  useEffect(() => {
    if (!authReady) return;
    try {
      localStorage.removeItem(SELLER_STORAGE.store);
      localStorage.removeItem(SELLER_STORAGE.listings);
    } catch {
      /* ignore */
    }
    setReady(false);
    void load();
  }, [authReady, load]);

  const apply = useCallback(async (input: ApplicationInput) => {
    const res = await apiSend<{ application: SellerApplication }>("POST", "/api/seller/apply", input);
    setApplication(res.application);
  }, []);

  const saveStore = useCallback(async (next: SellerStore) => {
    const res = await apiSend<{ store: SellerStore }>("PUT", "/api/seller/store", {
      name: next.name,
      slug: next.slug,
      city: next.city,
      phone: next.phone,
      bio: next.bio,
    });
    setStore(res.store);
  }, []);

  const saveListing = useCallback(async ({ id, ...body }: ListingInput) => {
    const res = id
      ? await apiSend<{ listing: SellerListing }>("PATCH", `/api/seller/listings/${id}`, body)
      : await apiSend<{ listing: SellerListing }>("POST", "/api/seller/listings", body);
    const saved = res.listing;
    setListings((prev) => {
      const exists = prev.some((item) => item.id === saved.id);
      return exists ? prev.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...prev];
    });
    return saved;
  }, []);

  const removeListing = useCallback(async (id: string) => {
    await apiSend<{ ok: boolean }>("DELETE", `/api/seller/listings/${id}`);
    setListings((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const advanceOrder = useCallback(async (orderId: string, status: "packed" | "shipped") => {
    const res = await apiSend<{ order: SellerOrder }>(
      "PATCH",
      `/api/seller/orders/${encodeURIComponent(orderId)}`,
      { status },
    );
    setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
  }, []);

  const value = useMemo(
    () => ({
      ready,
      application,
      apply,
      store,
      saveStore,
      listings,
      saveListing,
      removeListing,
      orders,
      advanceOrder,
      earnings,
      refresh: load,
    }),
    [ready, application, apply, store, saveStore, listings, saveListing, removeListing, orders, advanceOrder, earnings, load],
  );

  return <SellerContext.Provider value={value}>{children}</SellerContext.Provider>;
}

export function useSeller() {
  const ctx = useContext(SellerContext);
  if (!ctx) throw new Error("useSeller must be used within SellerProvider");
  return ctx;
}
