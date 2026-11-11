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
import { apiGet, apiSend } from "@/lib/api-client";

type AdminMediaContextValue = {
  ready: boolean;
  media: AdminMediaState;
  setCategoryImage: (id: string, dataUrl: string | null) => Promise<void>;
  setProductImage: (id: string, dataUrl: string | null) => Promise<void>;
  setHeroImage: (index: number, dataUrl: string | null) => Promise<void>;
  setAnnouncement: (text: string) => Promise<void>;
  resetMedia: () => Promise<void>;
};

const AdminMediaContext = createContext<AdminMediaContextValue | null>(null);

async function patchMedia(body: unknown) {
  return apiSend<{ media: AdminMediaState }>("PATCH", "/api/admin/media", body);
}

export function AdminMediaProvider({ children }: { children: React.ReactNode }) {
  const [media, setMedia] = useState<AdminMediaState>(emptyAdminMedia);
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    const res = await apiGet<{ media: AdminMediaState }>("/api/media");
    setMedia(res.media);
  }, []);

  useEffect(() => {
    let cancelled = false;
    try {
      localStorage.removeItem(ADMIN_MEDIA_KEY);
    } catch {
      /* ignore */
    }
    (async () => {
      try {
        const res = await apiGet<{ media: AdminMediaState }>("/api/media");
        if (!cancelled) setMedia(res.media);
      } catch {
        /* shop still renders default art */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const runUpdate = useCallback(
    async (optimistic: (prev: AdminMediaState) => AdminMediaState, body: unknown) => {
      setMedia(optimistic);
      try {
        const res = await patchMedia(body);
        setMedia(res.media);
      } catch (err) {
        await reload().catch(() => setMedia(emptyAdminMedia()));
        throw err;
      }
    },
    [reload],
  );

  const setCategoryImage = useCallback(
    (id: string, dataUrl: string | null) =>
      runUpdate((prev) => {
        const categoryImages = { ...prev.categoryImages };
        if (dataUrl) categoryImages[id] = dataUrl;
        else delete categoryImages[id];
        return { ...prev, categoryImages };
      }, { target: "category", id, dataUrl }),
    [runUpdate],
  );

  const setProductImage = useCallback(
    (id: string, dataUrl: string | null) =>
      runUpdate((prev) => {
        const productImages = { ...prev.productImages };
        if (dataUrl) productImages[id] = dataUrl;
        else delete productImages[id];
        return { ...prev, productImages };
      }, { target: "product", id, dataUrl }),
    [runUpdate],
  );

  const setHeroImage = useCallback(
    (index: number, dataUrl: string | null) => {
      const key = String(index);
      return runUpdate((prev) => {
        const heroImages = { ...prev.heroImages };
        if (dataUrl) heroImages[key] = dataUrl;
        else delete heroImages[key];
        return { ...prev, heroImages };
      }, { target: "hero", index, dataUrl });
    },
    [runUpdate],
  );

  const setAnnouncement = useCallback(
    (text: string) =>
      runUpdate(
        (prev) => ({ ...prev, announcement: text }),
        { target: "announcement", announcement: text },
      ),
    [runUpdate],
  );

  const resetMedia = useCallback(
    () => runUpdate(() => emptyAdminMedia(), { target: "reset" }),
    [runUpdate],
  );

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
    [ready, media, setCategoryImage, setProductImage, setHeroImage, setAnnouncement, resetMedia],
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
