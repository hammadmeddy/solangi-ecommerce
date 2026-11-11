"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CATALOG, type DemoProduct } from "@/lib/products";
import { MODE_CATALOG } from "@/lib/modes-catalog";
import type { ModeId } from "@/lib/categories";
import { apiGet } from "@/lib/api-client";

const STATIC_CATALOG: DemoProduct[] = [...CATALOG, ...MODE_CATALOG];

export function usePublicCatalog() {
  const [apiProducts, setApiProducts] = useState<DemoProduct[] | null>(null);
  const [apiReady, setApiReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiGet<{ products: DemoProduct[] }>("/api/products");
        if (!cancelled) setApiProducts(res.products);
      } catch {
        if (!cancelled) setApiProducts(null);
      } finally {
        if (!cancelled) setApiReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const catalog = useMemo(
    () => (apiProducts ? apiProducts : STATIC_CATALOG),
    [apiProducts],
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
    (categoryId: string) => catalog.filter((product) => product.categoryId === categoryId),
    [catalog],
  );

  const byMode = useCallback(
    (mode: ModeId) => catalog.filter((product) => (product.mode ?? "retail") === mode),
    [catalog],
  );

  return {
    ready: apiReady,
    catalog,
    sellerOnly,
    getById,
    byCategory,
    byMode,
  };
}
