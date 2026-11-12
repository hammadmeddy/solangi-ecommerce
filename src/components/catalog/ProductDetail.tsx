"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useCart } from "@/components/providers/CartProvider";
import { CategoryMedia } from "@/components/media/CategoryIcon";
import { modeLabel } from "@/lib/modes-catalog";
import { productMode, type DemoProduct } from "@/lib/products";

export function ProductDetail({ product }: { product: DemoProduct }) {
  const t = useTranslations("Catalog");
  const { format } = useCurrency();
  const { addProduct } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const stars = "★".repeat(product.rating) + "☆".repeat(5 - product.rating);
  const mode = productMode(product);
  const qty = product.minQty && product.minQty > 1 ? product.minQty : 1;
  const isService = mode === "services";
  const modeHref = `/mode/${mode}`;

  function onAdd() {
    addProduct(product, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="wrap py-10 md:py-14">
      <nav className="mb-6 text-sm text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--teal)]">
          {t("home")}
        </Link>
        <span className="mx-2">/</span>
        <Link href={modeHref} className="hover:text-[var(--teal)]">
          {modeLabel(mode)}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--ink)]">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="relative min-h-[360px] overflow-hidden rounded-2xl border border-[var(--line)]">
          {product.discountLabel ? (
            <span className="absolute left-4 top-4 z-10 rounded bg-[var(--sale)] px-2.5 py-1 text-xs font-bold text-white">
              {product.discountLabel}
            </span>
          ) : null}
          <CategoryMedia
            categoryId={product.categoryId}
            productId={product.id}
            src={product.imageUrl}
            label={product.name}
            size="lg"
            className="h-full min-h-[360px] w-full"
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gold)]">
            {product.category}
          </p>
          <h1 className="font-display mb-3 text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-tight">
            {product.name}
          </h1>
          <div className="mb-4 text-[var(--gold)] tracking-wide">{stars}</div>
          <div className="mb-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{format(product.pricePkr)}</span>
            {product.oldPricePkr ? (
              <span className="text-lg text-[var(--muted)] line-through">
                {format(product.oldPricePkr)}
              </span>
            ) : null}
          </div>
          <p className="mb-6 max-w-[48ch] text-[var(--muted)] leading-relaxed">
            {product.description}
          </p>
          <dl className="mb-8 grid gap-2 text-sm">
            <div className="flex gap-2">
              <dt className="font-semibold text-[var(--ink)]">{t("seller")}:</dt>
              <dd className="text-[var(--muted)]">{product.seller}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-[var(--ink)]">{t("availability")}:</dt>
              <dd className="text-[var(--teal)]">{product.stockLabel}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-[var(--ink)]">{t("mode")}:</dt>
              <dd className="text-[var(--muted)]">{modeLabel(mode)}</dd>
            </div>
            {product.minQty ? (
              <div className="flex gap-2">
                <dt className="font-semibold text-[var(--ink)]">{t("minQty")}:</dt>
                <dd className="text-[var(--muted)]">{product.minQty}</dd>
              </div>
            ) : null}
            {product.condition ? (
              <div className="flex gap-2">
                <dt className="font-semibold text-[var(--ink)]">{t("condition")}:</dt>
                <dd className="text-[var(--muted)]">{product.condition}</dd>
              </div>
            ) : null}
            {product.serviceArea ? (
              <div className="flex gap-2">
                <dt className="font-semibold text-[var(--ink)]">{t("serviceArea")}:</dt>
                <dd className="text-[var(--muted)]">{product.serviceArea}</dd>
              </div>
            ) : null}
          </dl>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-[var(--cream)] hover:bg-[var(--teal)]"
            >
              {added
                ? t("added")
                : isService
                  ? t("bookService")
                  : mode === "wholesale"
                    ? t("addMoq")
                    : t("addToCart")}
            </button>
            <button
              type="button"
              onClick={() => {
                addProduct(product, qty);
                router.push("/checkout");
              }}
              className="inline-flex rounded-full border border-[var(--line)] px-5 py-3 text-sm font-semibold hover:border-[var(--teal)] hover:text-[var(--teal)]"
            >
              {isService ? t("bookNow") : t("buyNow")}
            </button>
            <Link
              href={modeHref}
              className="inline-flex rounded-full border border-[var(--line)] px-5 py-3 text-sm font-semibold hover:border-[var(--teal)] hover:text-[var(--teal)]"
            >
              {t("moreInMode")}
            </Link>
          </div>
          <p className="mt-4 text-xs text-[var(--muted)]">
            {isService ? t("serviceNote") : t("cartNote")}
          </p>
        </div>
      </div>
    </div>
  );
}
