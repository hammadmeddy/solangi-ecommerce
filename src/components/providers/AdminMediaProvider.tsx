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
  ADMIN_MEDIA_KEY,
  emptyAdminMedia,
  type AdminMediaState,
} from "@/lib/admin";

type AdminMediaContextValue = {
  ready: boolean;
  media: AdminMediaState;
  setCategoryImage: (id: string, dataUrl: string | null) => void;
  setProductImage: (id: string, dataUrl: string | null) => void;
  setHeroImage: (index: number, dataUrl: string | null) => void;
  setAnnouncement: (text: string) => void;
  resetMedia: () => void;
};

const AdminMediaContext = createContext<AdminMediaContextValue | null>(null);

export function AdminMediaProvider({ children }: { children: React.ReactNode }) {
  const [media, setMedia] = useState<AdminMediaState>(emptyAdminMedia);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ADMIN_MEDIA_KEY);
      if (raw) setMedia({ ...emptyAdminMedia(), ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: AdminMediaState) => {
    setMedia(next);
    try {
      localStorage.setItem(ADMIN_MEDIA_KEY, JSON.stringify(next));
    } catch {
      /* ignore — large data URLs may hit quota */
    }
  }, []);

  const setCategoryImage = useCallback(
    (id: string, dataUrl: string | null) => {
      setMedia((prev) => {
        const categoryImages = { ...prev.categoryImages };
        if (dataUrl) categoryImages[id] = dataUrl;
        else delete categoryImages[id];
        const next = { ...prev, categoryImages };
        try {
          localStorage.setItem(ADMIN_MEDIA_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const setProductImage = useCallback((id: string, dataUrl: string | null) => {
    setMedia((prev) => {
      const productImages = { ...prev.productImages };
      if (dataUrl) productImages[id] = dataUrl;
      else delete productImages[id];
      const next = { ...prev, productImages };
      try {
        localStorage.setItem(ADMIN_MEDIA_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const setHeroImage = useCallback((index: number, dataUrl: string | null) => {
    const key = String(index);
    setMedia((prev) => {
      const heroImages = { ...prev.heroImages };
      if (dataUrl) heroImages[key] = dataUrl;
      else delete heroImages[key];
      const next = { ...prev, heroImages };
      try {
        localStorage.setItem(ADMIN_MEDIA_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const setAnnouncement = useCallback((text: string) => {
    setMedia((prev) => {
      const next = { ...prev, announcement: text };
      try {
        localStorage.setItem(ADMIN_MEDIA_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const resetMedia = useCallback(() => {
    persist(emptyAdminMedia());
  }, [persist]);

  const value = useMemo(
    () => ({
      ready,
      media,
      setCategoryImage,
      setProductImage,
      setHeroImage,
      setAnnouncement,
      resetMedia,
    }),
    [
      ready,
      media,
      setCategoryImage,
      setProductImage,
      setHeroImage,
      setAnnouncement,
      resetMedia,
    ],
  );

  return (
    <AdminMediaContext.Provider value={value}>{children}</AdminMediaContext.Provider>
  );
}

export function useAdminMedia() {
  const ctx = useContext(AdminMediaContext);
  if (!ctx) throw new Error("useAdminMedia must be used within AdminMediaProvider");
  return ctx;
}
