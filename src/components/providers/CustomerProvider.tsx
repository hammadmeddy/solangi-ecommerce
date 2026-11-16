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
  DEMO_ORDERS,
  type CustomerAddress,
  type CustomerOrder,
  type WishlistItem,
} from "@/lib/customer";
import { apiGet, apiSend } from "@/lib/api-client";
import { useAuth } from "./AuthProvider";
import { FEATURED_PRODUCTS, TRENDING_PRODUCTS } from "@/lib/products";

type ProfileExtra = {
  email: string;
  city: string;
};

type CustomerContextValue = {
  ready: boolean;
  email: string;
  city: string;
  saveProfileExtra: (input: ProfileExtra) => void;
  addresses: CustomerAddress[];
  saveAddress: (address: CustomerAddress) => void;
  removeAddress: (id: string) => void;
  orders: CustomerOrder[];
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

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const orders = DEMO_ORDERS;

  useEffect(() => {
    let cancelled = false;
    const profile = readJson<ProfileExtra>(CUSTOMER_STORAGE.profileExtra, {
      email: user?.email ?? "",
      city: "",
    });
    setEmail(profile.email || user?.email || "");
    setCity(profile.city);

    if (!user) {
      setAddresses(
        readJson<CustomerAddress[]>(
          CUSTOMER_STORAGE.addresses,
          DEFAULT_ADDRESSES.map((a) => ({ ...a, fullName: a.fullName, phone: a.phone })),
        ),
      );
      const storedWishlist = readJson<WishlistItem[]>(CUSTOMER_STORAGE.wishlist, []);
      setWishlist(
        storedWishlist.length
          ? storedWishlist
          : [...FEATURED_PRODUCTS, ...TRENDING_PRODUCTS].slice(0, 2).map((p) => ({
              productId: p.id,
              name: p.name,
              category: p.category,
              pricePkr: p.pricePkr,
              addedAt: new Date().toISOString().slice(0, 10),
            })),
      );
      setReady(true);
      return;
    }

    setReady(false);
    void (async () => {
      try {
        const [addressRes, wishRes] = await Promise.all([
          apiGet<{ addresses: CustomerAddress[] }>("/api/account/addresses"),
          apiGet<{ wishlist: WishlistItem[] }>("/api/account/wishlist"),
        ]);
        if (cancelled) return;
        setAddresses(addressRes.addresses || []);
        setWishlist(wishRes.wishlist || []);
      } catch {
        if (!cancelled) {
          setAddresses([]);
          setWishlist([]);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const saveProfileExtra = useCallback((input: ProfileExtra) => {
    setEmail(input.email);
    setCity(input.city);
    localStorage.setItem(CUSTOMER_STORAGE.profileExtra, JSON.stringify(input));
  }, []);

  const saveAddress = useCallback(
    (address: CustomerAddress) => {
      if (!user) {
        setAddresses((prev) => {
          const exists = prev.some((a) => a.id === address.id);
          let next = exists
            ? prev.map((a) => (a.id === address.id ? address : a))
            : [...prev, address];
          if (address.isDefault) {
            next = next.map((a) => ({ ...a, isDefault: a.id === address.id }));
          }
          localStorage.setItem(CUSTOMER_STORAGE.addresses, JSON.stringify(next));
          return next;
        });
        return;
      }

      const isNew = address.id.startsWith("local-") || address.id.startsWith("addr-");
      void apiSend<{ address: CustomerAddress }>("POST", "/api/account/addresses", {
        ...address,
        id: isNew ? undefined : address.id,
      }).then((res) => {
        setAddresses((prev) => {
          const without = prev.filter((a) => a.id !== address.id && a.id !== res.address.id);
          const next = [...without, res.address];
          return res.address.isDefault
            ? next.map((a) => ({ ...a, isDefault: a.id === res.address.id }))
            : next;
        });
      });
    },
    [user],
  );

  const removeAddress = useCallback(
    (id: string) => {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      if (!user) {
        const next = addresses.filter((a) => a.id !== id);
        localStorage.setItem(CUSTOMER_STORAGE.addresses, JSON.stringify(next));
        return;
      }
      void apiSend("DELETE", `/api/account/addresses?id=${encodeURIComponent(id)}`);
    },
    [user, addresses],
  );

  const toggleWishlist = useCallback(
    (item: Omit<WishlistItem, "addedAt">) => {
      if (!user) {
        setWishlist((prev) => {
          const exists = prev.some((w) => w.productId === item.productId);
          const next = exists
            ? prev.filter((w) => w.productId !== item.productId)
            : [...prev, { ...item, addedAt: new Date().toISOString().slice(0, 10) }];
          localStorage.setItem(CUSTOMER_STORAGE.wishlist, JSON.stringify(next));
          return next;
        });
        return;
      }

      setWishlist((prev) => {
        const exists = prev.some((w) => w.productId === item.productId);
        return exists
          ? prev.filter((w) => w.productId !== item.productId)
          : [...prev, { ...item, addedAt: new Date().toISOString().slice(0, 10) }];
      });
      void apiSend("POST", "/api/account/wishlist", item);
    },
    [user],
  );

  const removeWishlist = useCallback(
    (productId: string) => {
      setWishlist((prev) => prev.filter((w) => w.productId !== productId));
      if (!user) {
        const next = wishlist.filter((w) => w.productId !== productId);
        localStorage.setItem(CUSTOMER_STORAGE.wishlist, JSON.stringify(next));
        return;
      }
      void apiSend("DELETE", `/api/account/wishlist?productId=${encodeURIComponent(productId)}`);
    },
    [user, wishlist],
  );

  const value = useMemo(
    () => ({
      ready,
      email,
      city,
      saveProfileExtra,
      addresses,
      saveAddress,
      removeAddress,
      orders,
      wishlist,
      toggleWishlist,
      removeWishlist,
    }),
    [
      ready,
      email,
      city,
      saveProfileExtra,
      addresses,
      saveAddress,
      removeAddress,
      orders,
      wishlist,
      toggleWishlist,
      removeWishlist,
    ],
  );

  return (
    <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>
  );
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error("useCustomer must be used within CustomerProvider");
  return ctx;
}
