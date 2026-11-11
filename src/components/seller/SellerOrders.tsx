"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSeller } from "@/components/providers/SellerProvider";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { SellerShell } from "./SellerShell";

export function SellerOrders() {
  const t = useTranslations("Seller");
  const { user } = useAuth();
  const { orders, ready } = useSeller();
  const { format } = useCurrency();

  if (!user || user.role !== "seller") {
    return (
      <SellerShell title={t("ordersTitle")} subtitle={t("ordersSub")}>
        <p className="text-[var(--muted)]">{t("loading")}</p>
      </SellerShell>
    );
  }

  return (
    <SellerShell title={t("ordersTitle")} subtitle={t("ordersSub")}>
      {!ready ? (
        <p className="text-[var(--muted)]">{t("loading")}</p>
      ) : (
        <>
          <p className="mb-4 text-sm text-[var(--muted)]">{t("ordersDemoNote")}</p>
          <ul className="grid gap-3">
            {orders.map((order) => (
              <li key={order.id} className="rounded-xl border border-[var(--line)] bg-[var(--cream)]/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{order.id}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {order.placedAt} · {order.buyer}
                    </p>
                    <p className="mt-1 text-sm">{order.summary}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{format(order.totalPkr)}</p>
                    <p className="mt-1 inline-flex rounded-full bg-[var(--teal-soft)] px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-[var(--teal)]">
                      {t(`orderStatus.${order.status}`)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </SellerShell>
  );
}
