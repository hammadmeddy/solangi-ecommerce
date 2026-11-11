"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCustomer } from "@/components/providers/CustomerProvider";
import { useCart } from "@/components/providers/CartProvider";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { CustomerShell } from "./CustomerShell";

export function CustomerOrders() {
  const t = useTranslations("Customer");
  const { user } = useAuth();
  const { orders, ready } = useCustomer();
  const { placedOrders } = useCart();
  const { format } = useCurrency();

  const merged = useMemo(() => {
    const live = placedOrders.map((o) => ({
      id: o.id,
      placedAt: o.placedAt,
      status: "placed" as const,
      totalPkr: o.totalPkr,
      itemCount: o.itemCount,
      summary: `${o.summary} · ${o.payment} · ${o.addressLabel}`,
    }));
    return [...live, ...orders];
  }, [placedOrders, orders]);

  if (!user) return null;

  return (
    <CustomerShell title={t("ordersTitle")} subtitle={t("ordersSub")}>
      {!ready ? (
        <p className="text-[var(--muted)]">{t("loading")}</p>
      ) : (
        <>
          <p className="mb-4 text-sm text-[var(--muted)]">{t("ordersDemoNote")}</p>
          <ul className="grid gap-3">
            {merged.map((order) => (
              <li key={order.id} className="rounded-xl border border-[var(--line)] bg-[var(--cream)]/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{order.id}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {order.placedAt} · {order.itemCount} {t("items")}
                    </p>
                    <p className="mt-1 text-sm">{order.summary}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{format(order.totalPkr)}</p>
                    <p className="mt-1 inline-flex rounded-full bg-[var(--teal-soft)] px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-[var(--teal)]">
                      {t(`status.${order.status}`)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/cart" className="mt-6 inline-flex text-sm font-semibold text-[var(--teal)] hover:underline">
            {t("goCart")} →
          </Link>
        </>
      )}
    </CustomerShell>
  );
}
