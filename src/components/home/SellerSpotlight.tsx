"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/catalog/ProductCard";
import { usePublicCatalog } from "@/components/catalog/usePublicCatalog";

/** Shows active seller listings on the homepage when present. */
export function SellerSpotlight() {
  const t = useTranslations("Catalog");
  const { ready, sellerOnly } = usePublicCatalog();

  if (!ready || sellerOnly.length === 0) return null;

  return (
    <section id="from-sellers" className="pb-14">
      <div className="wrap">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-[clamp(1.8rem,3vw,2.35rem)] font-semibold leading-tight">
              {t("fromSellersTitle")}
            </h2>
            <p className="mt-1 max-w-[40ch] text-[0.95rem] text-[var(--muted)]">
              {t("fromSellersSub")}
            </p>
          </div>
          <Link href="/seller/listings" className="text-[0.85rem] font-semibold text-[var(--teal)] hover:underline">
            {t("manageListings")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
          {sellerOnly.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
