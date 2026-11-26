"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSeller } from "@/components/providers/SellerProvider";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { EmptyState, StatCard, StatusPill } from "@/components/admin/AdminBits";
import { SellerShell } from "./SellerShell";

export function SellerEarnings() {
  const t = useTranslations("Seller");
  const { user } = useAuth();
  const { earnings, ready } = useSeller();
  const { format } = useCurrency();

  if (!user || user.role !== "seller" || !ready) {
    return (
      <SellerShell title={t("earningsTitle")} subtitle={t("earningsSub")}>
        <PremiumLoader variant="panel" label={t("loading")} />
      </SellerShell>
    );
  }

  return (
    <SellerShell title={t("earningsTitle")} subtitle={t("earningsSub")}>
      {!earnings ? (
        <EmptyState>{t("earningsUnavailable")}</EmptyState>
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label={t("earnGross")} value={format(earnings.grossPkr)} hint={t("earnGrossHint")} />
            <StatCard
              label={t("earnCommission")}
              value={format(earnings.commissionPkr)}
              hint={t("earnCommissionHint", { pct: earnings.commissionPct })}
            />
            <StatCard label={t("earnPaid")} value={format(earnings.paidPkr)} />
            <StatCard
              label={t("earnAvailable")}
              value={format(earnings.availablePkr)}
              hint={earnings.pendingPayoutPkr ? t("earnPendingHint", { amount: format(earnings.pendingPayoutPkr) }) : undefined}
            />
          </div>
          <p className="mb-8 text-sm text-[var(--muted)]">
            {t("earnOpenNote", { amount: format(earnings.openPkr) })}
          </p>

          <h2 className="mb-3 font-display text-xl font-semibold">{t("payoutHistory")}</h2>
          {earnings.payouts.length === 0 ? (
            <EmptyState>{t("payoutsEmpty")}</EmptyState>
          ) : (
            <ul className="grid gap-2">
              {earnings.payouts.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] px-4 py-3 text-sm">
                  <div>
                    <p className="font-semibold">{format(p.amountPkr)}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {p.createdAt.slice(0, 10)}
                      {p.periodLabel ? ` · ${p.periodLabel}` : ""}
                      {p.paidAt ? ` · ${t("paidOn")} ${p.paidAt.slice(0, 10)}` : ""}
                      {p.note ? ` · ${p.note}` : ""}
                    </p>
                  </div>
                  <StatusPill status={p.status} label={t(`payout_${p.status}`)} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </SellerShell>
  );
}
