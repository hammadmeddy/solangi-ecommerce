"use client";

import { FormEvent, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { CATEGORIES, MODES } from "@/lib/categories";
import { MODE_CATALOG } from "@/lib/modes-catalog";
import { filterProducts, parseSearchFilters, type SearchFilters } from "@/lib/search";
import { ProductCard } from "@/components/catalog/ProductCard";
import { usePublicCatalog } from "@/components/catalog/usePublicCatalog";
import { UiDropdown } from "@/components/ui/UiDropdown";

export function SearchView({
  initial,
}: {
  initial: {
    q?: string;
    mode?: string;
    cat?: string;
    min?: string;
    max?: string;
    sort?: string;
  };
}) {
  const t = useTranslations("Search");
  const router = useRouter();
  const { ready, catalog } = usePublicCatalog();
  const parsed = parseSearchFilters(initial);

  const [q, setQ] = useState(parsed.q);
  const [mode, setMode] = useState<SearchFilters["mode"]>(parsed.mode);
  const [categoryId, setCategoryId] = useState(parsed.categoryId);
  const [minPrice, setMinPrice] = useState(parsed.minPrice?.toString() ?? "");
  const [maxPrice, setMaxPrice] = useState(parsed.maxPrice?.toString() ?? "");
  const [sort, setSort] = useState<SearchFilters["sort"]>(parsed.sort);

  const universe = useMemo(() => {
    const ids = new Set(catalog.map((p) => p.id));
    const extras = MODE_CATALOG.filter((p) => !ids.has(p.id));
    return [...catalog, ...extras];
  }, [catalog]);

  const filters: SearchFilters = useMemo(
    () => ({
      q,
      mode,
      categoryId,
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
      sort,
    }),
    [q, mode, categoryId, minPrice, maxPrice, sort],
  );

  const results = useMemo(
    () => filterProducts(universe, filters),
    [universe, filters],
  );

  function pushQuery(next: SearchFilters) {
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.mode !== "all") params.set("mode", next.mode);
    if (next.categoryId !== "all") params.set("cat", next.categoryId);
    if (next.minPrice != null) params.set("min", String(next.minPrice));
    if (next.maxPrice != null) params.set("max", String(next.maxPrice));
    if (next.sort !== "relevance") params.set("sort", next.sort);
    const qs = params.toString();
    router.push(qs ? `/search?${qs}` : "/search");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    pushQuery(filters);
  }

  function clearFilters() {
    setQ("");
    setMode("all");
    setCategoryId("all");
    setMinPrice("");
    setMaxPrice("");
    setSort("relevance");
    router.push("/search");
  }

  return (
    <section className="wrap py-8 md:py-12">
      <div className="mb-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gold)]">
          {t("eyebrow")}
        </p>
        <h1 className="font-display text-[clamp(1.9rem,3.5vw,2.6rem)] font-semibold leading-tight">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-[52ch] text-[var(--muted)]">{t("sub")}</p>
      </div>

      <form
        onSubmit={onSubmit}
        className="mb-6 grid gap-3 rounded-2xl border border-[var(--line)] bg-white/80 p-4 md:p-5"
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="search-q">
            {t("query")}
          </label>
          <input
            id="search-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("queryPh")}
            className="min-w-0 flex-1 rounded-full border border-[var(--line)] bg-[var(--cream)]/50 px-4 py-2.5 outline-none focus:border-[var(--teal)]"
          />
          <button
            type="submit"
            className="rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-[var(--cream)] hover:bg-[var(--teal)]"
          >
            {t("submit")}
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <UiDropdown
            variant="field"
            ariaLabel={t("mode")}
            label={t("mode")}
            value={mode}
            options={[
              { value: "all", label: t("allModes") },
              ...MODES.map((m) => ({
                value: m.id,
                label: `${m.label} · ${m.sub}`,
              })),
            ]}
            onChange={(next) => {
              const value = next as SearchFilters["mode"];
              setMode(value);
              pushQuery({ ...filters, mode: value });
            }}
          />

          <UiDropdown
            variant="field"
            ariaLabel={t("category")}
            label={t("category")}
            value={categoryId}
            options={[
              { value: "all", label: t("allCategories") },
              ...CATEGORIES.filter((c) => c.id !== "services").map((c) => ({
                value: c.id,
                label: c.name,
              })),
            ]}
            onChange={(next) => {
              setCategoryId(next);
              pushQuery({ ...filters, categoryId: next });
            }}
          />

          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            {t("minPrice")}
            <input
              type="number"
              min={0}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className="rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-[var(--ink)]"
            />
          </label>

          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            {t("maxPrice")}
            <input
              type="number"
              min={0}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="—"
              className="rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-[var(--ink)]"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <UiDropdown
            variant="compact"
            ariaLabel={t("sort")}
            label={t("sort")}
            value={sort}
            options={[
              { value: "relevance", label: t("sortRelevance") },
              { value: "price-asc", label: t("sortPriceAsc") },
              { value: "price-desc", label: t("sortPriceDesc") },
            ]}
            onChange={(next) => {
              const value = next as SearchFilters["sort"];
              setSort(value);
              pushQuery({ ...filters, sort: value });
            }}
          />
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-semibold text-[var(--teal)] hover:underline"
          >
            {t("clear")}
          </button>
        </div>
      </form>

      <div className="mb-4 flex items-baseline justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">
          {ready
            ? t("resultCount", { count: results.length })
            : t("loading")}
        </p>
        {parsed.q ? (
          <p className="text-sm font-medium text-[var(--ink)]">
            {t("forQuery", { q: parsed.q })}
          </p>
        ) : null}
      </div>

      {!ready ? null : results.length === 0 ? (
        <p className="rounded-xl border border-[var(--line)] bg-white/60 px-5 py-10 text-center text-[var(--muted)]">
          {t("empty")}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
