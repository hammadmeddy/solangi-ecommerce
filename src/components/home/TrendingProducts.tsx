import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TRENDING_PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/catalog/ProductCard";

export function TrendingProducts() {
  const t = useTranslations("Trending");
  const f = useTranslations("Featured");

  return (
    <section id="trending" className="pb-14 pt-0">
      <div className="wrap">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-[clamp(1.8rem,3vw,2.35rem)] font-semibold leading-tight">
              {t("title")}
            </h2>
            <p className="mt-1 max-w-[40ch] text-[0.95rem] text-[var(--muted)]">{t("sub")}</p>
          </div>
          <Link href="/mode/retail" className="text-[0.85rem] font-semibold text-[var(--teal)] hover:underline">
            {f("viewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
          {TRENDING_PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
