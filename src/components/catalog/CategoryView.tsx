"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/catalog/ProductCard";
import { usePublicCatalog } from "@/components/catalog/usePublicCatalog";
import { CategoryMedia } from "@/components/media/CategoryIcon";
import type { Category } from "@/lib/categories";
import type { DemoProduct } from "@/lib/products";

export function CategoryView({
  category,
  initialProducts,
}: {
  category: Category;
  initialProducts?: DemoProduct[];
}) {
  const t = useTranslations("Catalog");
  const { byCategory, sellerOnly } = usePublicCatalog(initialProducts);
  const products =
    initialProducts && initialProducts.length > 0
      ? initialProducts
      : byCategory(category.id);
  const sellerIds = new Set(sellerOnly.map((p) => p.id));
  const sellerCount = products.filter((p) => sellerIds.has(p.id) || p.sellerOwned).length;

  return (
    <section className="wrap py-10 md:py-14">
      <nav className="mb-6 text-sm text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--teal)]">
          {t("home")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--ink)]">{category.name}</span>
      </nav>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gold)]">
            {t("retailMode")}
          </p>
          <h1 className="font-display text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-tight">
            {category.name}
          </h1>
          <p className="mt-2 max-w-[48ch] text-[var(--muted)]">{t("categorySub")}</p>
          {sellerCount > 0 ? (
            <p className="mt-2 text-sm font-medium text-[var(--teal)]">
              {t("includesSeller", { count: sellerCount })}
            </p>
          ) : null}
        </div>
        <CategoryMedia
          categoryId={category.id}
          label={category.name}
          size="md"
          className="h-24 w-24 rounded-xl border border-[var(--line)]"
        />
      </div>

      {products.length === 0 ? (
        <p className="rounded-xl border border-[var(--line)] bg-white/60 px-5 py-8 text-[var(--muted)]">
          {t("emptyCategory")}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
