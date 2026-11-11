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
    const profile = readJson<ProfileExtra>(CUSTOMER_STORAGE.profileExtra, {
      email: user?.email ?? "",
      city: "",
    });
    setEmail(profile.email);
    setCity(profile.city);

    const storedAddresses = readJson<CustomerAddress[]>(
      CUSTOMER_STORAGE.addresses,
      DEFAULT_ADDRESSES.map((a) => ({
        ...a,
        fullName: user?.name ?? a.fullName,
        phone: user?.phone ?? a.phone,
      })),
    );
    setAddresses(storedAddresses);

    const storedWishlist = readJson<WishlistItem[]>(CUSTOMER_STORAGE.wishlist, []);
    if (storedWishlist.length) {
      setWishlist(storedWishlist);
    } else {
      const seed = [...FEATURED_PRODUCTS, ...TRENDING_PRODUCTS].slice(0, 2).map((p) => ({
        productId: p.id,
        name: p.name,
        category: p.category,
        pricePkr: p.pricePkr,
        addedAt: new Date().toISOString().slice(0, 10),
      }));
      setWishlist(seed);
    }
    setReady(true);
  }, [user?.email, user?.name, user?.phone]);

  const saveProfileExtra = useCallback((input: ProfileExtra) => {
    setEmail(input.email);
    setCity(input.city);
    localStorage.setItem(CUSTOMER_STORAGE.profileExtra, JSON.stringify(input));
  }, []);

  const saveAddress = useCallback((address: CustomerAddress) => {
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
  }, []);

  const removeAddress = useCallback((id: string) => {
    setAddresses((prev) => {
      const next = prev.filter((a) => a.id !== id);
      localStorage.setItem(CUSTOMER_STORAGE.addresses, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleWishlist = useCallback((item: Omit<WishlistItem, "addedAt">) => {
    setWishlist((prev) => {
      const exists = prev.some((w) => w.productId === item.productId);
      const next = exists
        ? prev.filter((w) => w.productId !== item.productId)
        : [...prev, { ...item, addedAt: new Date().toISOString().slice(0, 10) }];
      localStorage.setItem(CUSTOMER_STORAGE.wishlist, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      const next = prev.filter((w) => w.productId !== productId);
      localStorage.setItem(CUSTOMER_STORAGE.wishlist, JSON.stringify(next));
      return next;
    });
  }, []);

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
