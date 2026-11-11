"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Building2,
  RefreshCw,
  ShoppingBag,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CATEGORIES, type ModeId } from "@/lib/categories";
import { modeLabel } from "@/lib/modes-catalog";
import { ProductCard } from "@/components/catalog/ProductCard";
import { usePublicCatalog } from "@/components/catalog/usePublicCatalog";

const ICONS: Record<ModeId, LucideIcon> = {
  retail: ShoppingBag,
  wholesale: Building2,
  used: RefreshCw,
  services: Wrench,
};

export function ModeMarketplace({
  mode,
  initialCategory,
}: {
  mode: ModeId;
  initialCategory?: string;
}) {
  const t = useTranslations("ModeShop");
  const tm = useTranslations("Modes");
  const { ready, byMode } = usePublicCatalog();
  const [categoryId, setCategoryId] = useState(initialCategory || "all");

  const products = useMemo(() => {
    const all = byMode(mode);
    if (categoryId === "all") return all;
    return all.filter((p) => p.categoryId === categoryId);
  }, [byMode, mode, categoryId]);

  const categoryOptions = useMemo(() => {
    const ids = new Set(byMode(mode).map((p) => p.categoryId));
    return CATEGORIES.filter((c) => ids.has(c.id));
  }, [byMode, mode]);

  const Icon = ICONS[mode];
  const title = tm(mode);
  const blurb =
    mode === "retail"
      ? t("retailBlurb")
      : mode === "wholesale"
        ? t("wholesaleBlurb")
        : mode === "used"
          ? t("usedBlurb")
          : t("servicesBlurb");

  return (
    <section className="wrap py-8 md:py-12">
      <nav className="mb-6 text-sm text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--teal)]">
          {t("home")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--ink)]">{title}</span>
      </nav>

      <div
        className="mb-8 overflow-hidden rounded-2xl border border-[var(--line)] p-6 md:p-8"
        style={{
          background:
            "linear-gradient(125deg, rgba(12,36,33,0.96), rgba(31,107,92,0.88) 55%, rgba(184,146,62,0.55))",
        }}
      >
        <div className="flex flex-wrap items-start gap-4 text-[var(--cream)]">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--gold)] text-[var(--ink)]">
            <Icon size={28} strokeWidth={1.7} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--gold-light)]">
              {modeLabel(mode)}
            </p>
            <h1 className="font-display text-[clamp(2rem,4vw,2.8rem)] font-semibold leading-tight">
              {title}
            </h1>
            <p className="mt-2 max-w-[48ch] text-sm text-white/80">{blurb}</p>
          </div>
          {mode === "retail" ? (
            <Link
              href="/"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]"
            >
              {t("shopHome")}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mb-5 hide-scrollbar flex gap-2 overflow-x-auto pb-1">
        <FilterChip
          active={categoryId === "all"}
          onClick={() => setCategoryId("all")}
          label={t("allCategories")}
        />
        {categoryOptions.map((cat) => (
          <FilterChip
            key={cat.id}
            active={categoryId === cat.id}
            onClick={() => setCategoryId(cat.id)}
            label={cat.name}
          />
        ))}
      </div>

      {!ready ? (
        <p className="text-[var(--muted)]">{t("loading")}</p>
      ) : products.length === 0 ? (
        <p className="rounded-xl border border-[var(--line)] bg-white/60 px-5 py-8 text-[var(--muted)]">
          {t("empty")}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <p className="mt-8 text-xs text-[var(--muted)]">{t("note")}</p>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition ${
        active
          ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--cream)]"
          : "border-[var(--line)] bg-white/80 text-[var(--ink-soft)] hover:border-[var(--teal)]"
      }`}
    >
      {label}
    </button>
  );
}
