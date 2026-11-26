"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSeller } from "@/components/providers/SellerProvider";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { SellerShell } from "./SellerShell";

export function SellerDashboard() {
  const t = useTranslations("Seller");
  const tc = useTranslations("Customer");
  const { user } = useAuth();
  const { store, listings, orders, earnings, ready } = useSeller();
  const { format } = useCurrency();

  if (!user || user.role !== "seller") {
    return (
      <SellerShell title={t("dashTitle")} subtitle={t("dashSub")}>
        <PremiumLoader variant="panel" label={t("loading")} />
      </SellerShell>
    );
  }

  const active = listings.filter((l) => l.status === "active").length;
  const pending = listings.filter((l) => l.status === "pending").length;
  const rejected = listings.filter((l) => l.status === "rejected").length;
  const lowStock = listings.filter((l) => l.status === "active" && l.stock > 0 && l.stock < 5).length;
  const toPack = orders.filter((o) => o.status === "placed").length;
  const openOrders = orders.filter(
    (o) => o.orderStatus === "placed" || o.orderStatus === "packed" || o.orderStatus === "shipped",
  );

  return (
    <SellerShell title={t("dashTitle")} subtitle={t("dashSub", { store: store.name })}>
      {!ready ? (
        <PremiumLoader variant="panel" label={t("loading")} />
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label={t("statActive")} value={String(active)} />
            <Stat label={t("statPending")} value={String(pending)} />
            <Stat label={t("statOpenOrders")} value={String(openOrders.length)} />
            <Stat label={t("statBalance")} value={format(earnings?.availablePkr ?? 0)} />
          </div>

          {toPack || rejected || lowStock ? (
            <ul className="mb-8 grid gap-2 text-sm">
              {toPack ? (
                <li className="rounded-xl bg-amber-50 px-4 py-2.5">
                  <Link href="/seller/orders" className="font-semibold text-amber-900 hover:underline">
                    {t("alertToPack", { n: toPack })} →
                  </Link>
                </li>
              ) : null}
              {rejected ? (
                <li className="rounded-xl bg-red-50 px-4 py-2.5">
                  <Link href="/seller/listings" className="font-semibold text-[var(--sale)] hover:underline">
                    {t("alertRejected", { n: rejected })} →
                  </Link>
                </li>
              ) : null}
              {lowStock ? (
                <li className="rounded-xl bg-[var(--mist)] px-4 py-2.5">
                  <Link href="/seller/listings" className="font-semibold hover:underline">
                    {t("alertLowStock", { n: lowStock })} →
                  </Link>
                </li>
              ) : null}
            </ul>
          ) : (
            <div className="mb-8" />
          )}

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
              {orders.length === 0 ? (
                <li className="text-sm text-[var(--muted)]">{t("ordersEmpty")}</li>
              ) : null}
              {orders.slice(0, 3).map((order) => (
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
                      {tc(`status.${order.status}`)}
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
