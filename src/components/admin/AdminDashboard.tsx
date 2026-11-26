"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AdminShell } from "./AdminShell";
import { StatCard } from "./AdminBits";
import { apiGet } from "@/lib/api-client";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { PremiumLoader } from "@/components/ui/PremiumLoader";

type Stats = {
  users: number;
  suspendedUsers: number;
  stores: Record<string, number>;
  products: Record<string, number>;
  orders: Record<string, number>;
  gmvPkr: number;
  deliveredPkr: number;
  commissionPkr: number;
  pendingPayoutPkr: number;
};

export function AdminDashboard() {
  const t = useTranslations("Admin");
  const { format } = useCurrency();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiGet<{ stats: Stats }>("/api/admin/stats")
      .then((d) => setStats(d.stats))
      .catch(() => setError(t("statsLoadFailed")));
  }, [t]);

  const pendingSellers = stats?.stores.pending ?? 0;
  const pendingListings = stats?.products.pending ?? 0;
  const openOrders =
    (stats?.orders.placed ?? 0) + (stats?.orders.packed ?? 0) + (stats?.orders.shipped ?? 0);
  const totalOrders = stats ? Object.values(stats.orders).reduce((a, b) => a + b, 0) : 0;

  const queues = [
    {
      href: "/admin/sellers" as const,
      title: t("queueSellers"),
      count: pendingSellers,
      body: t("queueSellersBody"),
    },
    {
      href: "/admin/moderation" as const,
      title: t("queueListings"),
      count: pendingListings,
      body: t("queueListingsBody"),
    },
    {
      href: "/admin/orders" as const,
      title: t("queueOrders"),
      count: stats?.orders.placed ?? 0,
      body: t("queueOrdersBody"),
    },
    {
      href: "/admin/payouts" as const,
      title: t("queuePayouts"),
      count: stats?.pendingPayoutPkr ? 1 : 0,
      body: stats ? t("queuePayoutsBody", { amount: format(stats.pendingPayoutPkr) }) : "",
    },
  ];

  return (
    <AdminShell title={t("dashTitle")} subtitle={t("dashSub")}>
      {error ? <p className="mb-4 text-sm text-[var(--sale)]">{error}</p> : null}
      {!stats && !error ? (
        <PremiumLoader variant="panel" label={t("loading")} />
      ) : stats ? (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label={t("statGmv")} value={format(stats.gmvPkr)} hint={t("statGmvHint")} />
            <StatCard
              label={t("statCommission")}
              value={format(stats.commissionPkr)}
              hint={t("statCommissionHint")}
            />
            <StatCard
              label={t("statOrders")}
              value={totalOrders}
              hint={t("statOrdersHint", { open: openOrders })}
            />
            <StatCard
              label={t("statUsers")}
              value={stats.users}
              hint={t("statUsersHint", {
                sellers: stats.stores.approved ?? 0,
                suspended: stats.suspendedUsers,
              })}
            />
          </div>

          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            {t("needsAttention")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {queues.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="rounded-xl border border-[var(--line)] bg-[var(--cream)]/60 p-4 transition hover:-translate-y-0.5 hover:border-[var(--teal)]/40 hover:shadow-[0_12px_28px_rgba(12,36,33,0.08)]"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold">{q.title}</h3>
                  {q.href !== "/admin/payouts" && q.count > 0 ? (
                    <span className="rounded-full bg-[var(--sale)] px-2 py-0.5 text-xs font-bold text-white">
                      {q.count}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-[var(--muted)]">{q.body}</p>
              </Link>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <StatCard label={t("statLiveProducts")} value={stats.products.active ?? 0} />
            <StatCard label={t("statOutProducts")} value={stats.products.out ?? 0} />
            <StatCard label={t("statDelivered")} value={format(stats.deliveredPkr)} />
          </div>
        </>
      ) : null}
    </AdminShell>
  );
}
