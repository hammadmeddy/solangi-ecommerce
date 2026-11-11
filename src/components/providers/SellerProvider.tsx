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
  type SellerListing,
  type SellerOrder,
  type SellerStore,
} from "@/lib/seller";
import { apiGet, apiSend } from "@/lib/api-client";
import { useAuth } from "./AuthProvider";

type SellerContextValue = {
  ready: boolean;
  store: SellerStore;
  saveStore: (store: SellerStore) => Promise<void>;
  listings: SellerListing[];
  saveListing: (listing: SellerListing) => Promise<void>;
  removeListing: (id: string) => Promise<void>;
  orders: SellerOrder[];
};

const SellerContext = createContext<SellerContextValue | null>(null);

export function SellerProvider({ children }: { children: React.ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const [ready, setReady] = useState(false);
  const [store, setStore] = useState<SellerStore>(defaultStore("", "Seller"));
  const [listings, setListings] = useState<SellerListing[]>([]);
  const orders = DEMO_SELLER_ORDERS;

  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;

    try {
      localStorage.removeItem(SELLER_STORAGE.store);
      localStorage.removeItem(SELLER_STORAGE.listings);
    } catch {
      /* ignore */
    }

    (async () => {
      if (user?.role !== "seller") {
        if (!cancelled) {
          setStore(defaultStore(user?.phone ?? "", user?.name ?? "Seller"));
          setListings([]);
          setReady(true);
        }
        return;
      }

      try {
        const [storeRes, listRes] = await Promise.all([
          apiGet<{ store: SellerStore }>("/api/seller/store"),
          apiGet<{ listings: SellerListing[] }>("/api/seller/listings"),
        ]);
        if (cancelled) return;
        setStore(storeRes.store);
        setListings(listRes.listings);
      } catch {
        if (!cancelled) {
          setStore(defaultStore(user.phone, user.name));
          setListings([]);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authReady, user]);

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

  const saveListing = useCallback(async (listing: SellerListing) => {
    let saved: SellerListing;
    const known = listings.some((item) => item.id === listing.id);
    if (known) {
      const res = await apiSend<{ listing: SellerListing }>(
        "PATCH",
        `/api/seller/listings/${listing.id}`,
        listing,
      );
      saved = res.listing;
    } else {
      const res = await apiSend<{ listing: SellerListing }>("POST", "/api/seller/listings", listing);
      saved = res.listing;
    }
    setListings((prev) => {
      const exists = prev.some((item) => item.id === saved.id);
      return exists ? prev.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...prev];
    });
  }, [listings]);

  const removeListing = useCallback(async (id: string) => {
    await apiSend<{ ok: boolean }>("DELETE", `/api/seller/listings/${id}`);
    setListings((prev) => prev.filter((item) => item.id !== id));
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

  return <SellerContext.Provider value={value}>{children}</SellerContext.Provider>;
}

export function useSeller() {
  const ctx = useContext(SellerContext);
  if (!ctx) throw new Error("useSeller must be used within SellerProvider");
  return ctx;
}
