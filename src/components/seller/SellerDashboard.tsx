"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSeller } from "@/components/providers/SellerProvider";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { SellerShell } from "./SellerShell";

export function SellerDashboard() {
  const t = useTranslations("Seller");
  const { user } = useAuth();
  const { store, listings, orders, ready } = useSeller();
  const { format } = useCurrency();

  if (!user || user.role !== "seller") {
    return (
      <SellerShell title={t("dashTitle")} subtitle={t("dashSub")}>
        <p className="text-[var(--muted)]">{t("loading")}</p>
      </SellerShell>
    );
  }

  const active = listings.filter((l) => l.status === "active").length;
  const openOrders = orders.filter((o) => o.status === "new" || o.status === "accepted" || o.status === "shipped");

  return (
    <SellerShell title={t("dashTitle")} subtitle={t("dashSub", { store: store.name })}>
      {!ready ? (
        <p className="text-[var(--muted)]">{t("loading")}</p>
      ) : (
        <>
          <div className="mb-8 grid gap-3 sm:grid-cols-3">
            <Stat label={t("statListings")} value={String(listings.length)} />
            <Stat label={t("statActive")} value={String(active)} />
            <Stat label={t("statOpenOrders")} value={String(openOrders.length)} />
          </div>

          <div className="mb-8 rounded-xl border border-[var(--line)] bg-[var(--mist)]/40 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              {t("storeCard")}
            </p>
            <p className="mt-1 font-display text-2xl font-semibold">{store.name}</p>
            <p className="text-sm text-[var(--muted)]">
              {store.city} · {store.verified ? t("verified") : t("unverified")}
            </p>
            <Link href="/seller/store" className="mt-2 inline-flex text-sm font-semibold text-[var(--teal)] hover:underline">
              {t("editStore")} →
            </Link>
          </div>

          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">{t("recentOrders")}</h2>
              <Link href="/seller/orders" className="text-sm font-semibold text-[var(--teal)] hover:underline">
                {t("viewAll")}
              </Link>
            </div>
            <ul className="grid gap-2">
              {orders.slice(0, 2).map((order) => (
                <li
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--line)] bg-[var(--cream)]/70 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold">{order.id}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {order.buyer} · {order.summary}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{format(order.totalPkr)}</p>
                    <p className="text-xs uppercase tracking-wide text-[var(--teal)]">
                      {t(`orderStatus.${order.status}`)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/seller/listings"
              className="rounded-xl border border-[var(--line)] bg-[var(--cream)]/60 px-4 py-4 hover:border-[var(--teal)]"
            >
              <p className="font-semibold">{t("navListings")}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{t("quickListings")}</p>
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-[var(--line)] bg-[var(--cream)]/60 px-4 py-4 hover:border-[var(--teal)]"
            >
              <p className="font-semibold">{t("viewShop")}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{t("viewShopBody")}</p>
            </Link>
          </div>
        </>
      )}
    </SellerShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--mist)]/50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
    </div>
  );
}
