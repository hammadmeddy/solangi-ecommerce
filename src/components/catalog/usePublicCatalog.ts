"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CATALOG, type DemoProduct } from "@/lib/products";
import { MODE_CATALOG } from "@/lib/modes-catalog";
import type { ModeId } from "@/lib/categories";
import { apiGet } from "@/lib/api-client";

const STATIC_CATALOG: DemoProduct[] = [...CATALOG, ...MODE_CATALOG];

/** Session-level cache so category clicks do not wait on a fresh full catalog fetch. */
let catalogCache: DemoProduct[] | null = null;
let catalogPromise: Promise<DemoProduct[] | null> | null = null;

function loadCatalog(): Promise<DemoProduct[] | null> {
  if (catalogCache) return Promise.resolve(catalogCache);
  if (!catalogPromise) {
    catalogPromise = apiGet<{ products: DemoProduct[] }>("/api/products")
      .then((res) => {
        catalogCache = res.products ?? null;
        return catalogCache;
      })
      .catch(() => {
        catalogPromise = null;
        return null;
      });
  }
  return catalogPromise;
}

export function usePublicCatalog(initialProducts?: DemoProduct[]) {
  const [apiProducts, setApiProducts] = useState<DemoProduct[] | null>(
    () => initialProducts ?? catalogCache,
  );

  useEffect(() => {
    let cancelled = false;
    if (catalogCache) {
      setApiProducts(catalogCache);
      return;
    }
    (async () => {
      const products = await loadCatalog();
      if (!cancelled && products) setApiProducts(products);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const catalog = useMemo(
    () => apiProducts ?? initialProducts ?? STATIC_CATALOG,
    [apiProducts, initialProducts],
  );

  const sellerOnly = useMemo(
    () => catalog.filter((product) => product.sellerOwned),
    [catalog],
  );

  const getById = useCallback(
    (id: string) => catalog.find((product) => product.id === id),
    [catalog],
  );

  const byCategory = useCallback(
    (categoryId: string) =>
      catalog.filter((product) => product.categoryId === categoryId),
    [catalog],
  );

  const byMode = useCallback(
    (mode: ModeId) =>
      catalog.filter((product) => (product.mode ?? "retail") === mode),
    [catalog],
  );

  return {
    /** Static/seed catalog is always available — never block the UI on API. */
    ready: true,
    catalog,
    sellerOnly,
    getById,
    byCategory,
    byMode,
  };
}
