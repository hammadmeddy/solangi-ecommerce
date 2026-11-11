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
  DEMO_SELLER_ORDERS,
  SELLER_STORAGE,
  defaultStore,
  seedListings,
  type SellerListing,
  type SellerOrder,
  type SellerStore,
} from "@/lib/seller";
import { useAuth } from "./AuthProvider";

type SellerContextValue = {
  ready: boolean;
  store: SellerStore;
  saveStore: (store: SellerStore) => void;
  listings: SellerListing[];
  saveListing: (listing: SellerListing) => void;
  removeListing: (id: string) => void;
  orders: SellerOrder[];
};

const SellerContext = createContext<SellerContextValue | null>(null);

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function SellerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ready, setReady] = useState(false);
  const [store, setStore] = useState<SellerStore>(defaultStore("", "Seller"));
  const [listings, setListings] = useState<SellerListing[]>([]);
  const orders = DEMO_SELLER_ORDERS;

  useEffect(() => {
    const fallbackStore = defaultStore(user?.phone ?? "", user?.name ?? "Seller");
    setStore(readJson(SELLER_STORAGE.store, fallbackStore));
    setListings(readJson(SELLER_STORAGE.listings, seedListings()));
    setReady(true);
  }, [user?.name, user?.phone]);

  const saveStore = useCallback((next: SellerStore) => {
    setStore(next);
    localStorage.setItem(SELLER_STORAGE.store, JSON.stringify(next));
  }, []);

  const saveListing = useCallback((listing: SellerListing) => {
    setListings((prev) => {
      const exists = prev.some((l) => l.id === listing.id);
      const next = exists
        ? prev.map((l) => (l.id === listing.id ? listing : l))
        : [...prev, listing];
      localStorage.setItem(SELLER_STORAGE.listings, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeListing = useCallback((id: string) => {
    setListings((prev) => {
      const next = prev.filter((l) => l.id !== id);
      localStorage.setItem(SELLER_STORAGE.listings, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      ready,
      store,
      saveStore,
      listings,
      saveListing,
      removeListing,
      orders,
    }),
    [ready, store, saveStore, listings, saveListing, removeListing, orders],
  );

  return (
    <SellerContext.Provider value={value}>{children}</SellerContext.Provider>
  );
}

export function useSeller() {
  const ctx = useContext(SellerContext);
  if (!ctx) throw new Error("useSeller must be used within SellerProvider");
  return ctx;
}
