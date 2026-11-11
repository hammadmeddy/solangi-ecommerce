"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSeller } from "@/components/providers/SellerProvider";
import {
  findPublicProduct,
  mergePublicCatalog,
  productsInCategory,
  activeListingProducts,
  catalogForMode,
} from "@/lib/catalog";
import { MODE_CATALOG } from "@/lib/modes-catalog";
import type { ModeId } from "@/lib/categories";
import type { DemoProduct } from "@/lib/products";
import { apiGet } from "@/lib/api-client";

export function usePublicCatalog() {
  const { listings, store, ready: sellerReady } = useSeller();
  const [apiProducts, setApiProducts] = useState<DemoProduct[] | null>(null);
  const [apiReady, setApiReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiGet<{ products: DemoProduct[] }>("/api/products");
        if (!cancelled) {
          setApiProducts(res.products);
          setApiReady(true);
        }
      } catch {
        if (!cancelled) {
          setApiProducts(null);
          setApiReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const localMerged = useMemo(
    () => mergePublicCatalog(listings, store),
    [listings, store],
  );

  const catalog = useMemo(() => {
    if (apiProducts && apiProducts.length > 0) {
      // Prefer API seed catalog; overlay active local seller listings by id
      const fromSellers = activeListingProducts(listings, store);
      const sellerIds = new Set(fromSellers.map((p) => p.id));
      const base = apiProducts.filter((p) => !sellerIds.has(p.id));
      return [...fromSellers, ...base];
    }
    return localMerged;
  }, [apiProducts, listings, store, localMerged]);

  const sellerOnly = useMemo(
    () => activeListingProducts(listings, store),
    [listings, store],
  );

  const getById = useCallback(
    (id: string) => {
      return (
        catalog.find((p) => p.id === id) ??
        findPublicProduct(id, listings, store) ??
        MODE_CATALOG.find((p) => p.id === id)
      );
    },
    [catalog, listings, store],
  );

  const byCategory = useCallback(
    (categoryId: string) => catalog.filter((p) => p.categoryId === categoryId),
    [catalog],
  );

  const byMode = useCallback(
    (mode: ModeId) => {
      if (apiProducts && apiProducts.length > 0) {
        if (mode === "retail") {
          const fromSellers = activeListingProducts(listings, store);
          const sellerIds = new Set(fromSellers.map((p) => p.id));
          return [
            ...fromSellers,
            ...apiProducts.filter((p) => (p.mode ?? "retail") === "retail" && !sellerIds.has(p.id)),
          ];
        }
        return apiProducts.filter((p) => p.mode === mode);
      }
      return catalogForMode(mode, listings, store);
    },
    [apiProducts, listings, store],
  );

  return {
    ready: sellerReady && apiReady,
    catalog,
    sellerOnly,
    getById,
    byCategory,
    byMode,
  };
}
