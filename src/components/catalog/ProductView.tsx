"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ProductDetail } from "@/components/catalog/ProductDetail";
import { usePublicCatalog } from "@/components/catalog/usePublicCatalog";

export function ProductView({ id }: { id: string }) {
  const t = useTranslations("Catalog");
  const { getById } = usePublicCatalog();
  const product = getById(id);

  if (!product) {
    return (
      <section className="wrap py-16 md:py-20">
        <h1 className="font-display mb-3 text-3xl font-semibold">{t("notFoundTitle")}</h1>
        <p className="mb-6 text-[var(--muted)]">{t("notFoundBody")}</p>
        <Link
          href="/"
          className="inline-flex rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-[var(--cream)] hover:bg-[var(--teal)]"
        >
          {t("home")}
        </Link>
      </section>
    );
  }

  return <ProductDetail product={product} />;
}
