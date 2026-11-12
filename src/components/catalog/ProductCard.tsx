"use client";

import { Link } from "@/i18n/navigation";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { CategoryMedia } from "@/components/media/CategoryIcon";
import { modeLabel } from "@/lib/modes-catalog";
import { productMode, type DemoProduct } from "@/lib/products";

export function ProductCard({ product }: { product: DemoProduct }) {
  const { format } = useCurrency();
  const stars = "★".repeat(product.rating) + "☆".repeat(5 - product.rating);
  const mode = productMode(product);

  return (
    <Link
      href={`/product/${product.id}`}
      className="flex flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-white/70 transition-transform duration-250 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(12,36,33,0.08)]"
    >
      <div className="relative aspect-[1/1.05] border-b border-[var(--line)]">
        {mode !== "retail" ? (
          <span className="absolute right-3 top-3 z-10 rounded bg-[var(--ink)]/90 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-[var(--gold-light)]">
            {modeLabel(mode).split("·")[0].trim()}
          </span>
        ) : null}
        {product.discountLabel ? (
          <span className="absolute left-3 top-3 z-10 rounded bg-[var(--sale)] px-2 py-0.5 text-[0.68rem] font-bold tracking-wide text-white">
            {product.discountLabel}
          </span>
        ) : null}
        <CategoryMedia
          categoryId={product.categoryId}
          productId={product.id}
          src={product.imageUrl}
          label={product.name}
          size="md"
          className="h-full w-full"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 px-4 pb-4 pt-3">
        <span className="text-[0.68rem] uppercase tracking-wider text-[var(--muted)]">
          {product.category}
        </span>
        <h3 className="text-[0.98rem] font-semibold leading-snug">{product.name}</h3>
        <div className="text-[0.75rem] tracking-wide text-[var(--gold)]">{stars}</div>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-[1.05rem] font-bold">{format(product.pricePkr)}</span>
          {product.oldPricePkr ? (
            <span className="text-[0.82rem] text-[var(--muted)] line-through">
              {format(product.oldPricePkr)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
