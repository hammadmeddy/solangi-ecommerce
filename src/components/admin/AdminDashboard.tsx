"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AdminShell } from "./AdminShell";
import { useAdminMedia } from "@/components/providers/AdminMediaProvider";
import { CATEGORIES } from "@/lib/categories";
import { CATALOG } from "@/lib/products";

export function AdminDashboard() {
  const t = useTranslations("Admin");
  const { media } = useAdminMedia();

  const catCount = Object.keys(media.categoryImages).length;
  const prodCount = Object.keys(media.productImages).length;
  const heroCount = Object.keys(media.heroImages).length;

  const cards = [
    {
      href: "/admin/media" as const,
      title: t("cardMedia"),
      body: t("cardMediaBody", { cat: catCount, hero: heroCount }),
    },
    {
      href: "/admin/catalog" as const,
      title: t("cardCatalog"),
      body: t("cardCatalogBody", { n: CATALOG.length, photos: prodCount }),
    },
    {
      href: "/admin/orders" as const,
      title: t("cardOrders"),
      body: t("cardOrdersBody"),
    },
    {
      href: "/admin/settings" as const,
      title: t("cardSettings"),
      body: t("cardSettingsBody"),
    },
  ];

  return (
    <AdminShell title={t("dashTitle")} subtitle={t("dashSub")}>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat label={t("statCategories")} value={`${catCount}/${CATEGORIES.length}`} />
        <Stat label={t("statProducts")} value={`${prodCount}/${CATALOG.length}`} />
        <Stat label={t("statHero")} value={`${heroCount}/3`} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-[var(--line)] bg-[var(--cream)]/60 p-4 transition hover:-translate-y-0.5 hover:border-[var(--teal)]/40 hover:shadow-[0_12px_28px_rgba(12,36,33,0.08)]"
          >
            <h2 className="mb-1 text-base font-semibold">{card.title}</h2>
            <p className="text-sm text-[var(--muted)]">{card.body}</p>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-xs text-[var(--muted)]">{t("demoNote")}</p>
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--mist)]/50 px-4 py-3">
      <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-semibold text-[var(--ink)]">{value}</p>
    </div>
  );
}
