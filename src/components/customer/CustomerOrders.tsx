"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { CustomerShell } from "./CustomerShell";
import type { PlacedOrder } from "@/lib/cart";
import { apiGet } from "@/lib/api-client";
import { isOrderStatus } from "@/lib/order-status";

export function CustomerOrders() {
  const t = useTranslations("Customer");
  const { user } = useAuth();
  const { format } = useCurrency();
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<{ orders: PlacedOrder[] }>("/api/orders");
        if (!cancelled) setOrders(data.orders || []);
      } catch {
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!user) return null;

  return (
    <CustomerShell title={t("ordersTitle")} subtitle={t("ordersSub")}>
      {!ready ? (
        <p className="text-[var(--muted)]">{t("loading")}</p>
      ) : orders.length === 0 ? (
        <p className="rounded-xl border border-[var(--line)] bg-[var(--mist)]/40 px-4 py-8 text-[var(--muted)]">
          {t("ordersEmpty")}
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm text-[var(--muted)]">{t("ordersLiveNote")}</p>
          <ul className="grid gap-3">
            {orders.map((order) => (
              <li
                key={order.id}
                className="rounded-xl border border-[var(--line)] bg-[var(--cream)]/60 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{order.id}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {order.placedAt} · {order.itemCount} {t("items")} · {order.payment}
                    </p>
                    <p className="mt-1 text-sm">{order.summary}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{order.addressLabel}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{format(order.totalPkr)}</p>
                    <p className="mt-1 inline-flex rounded-full bg-[var(--teal-soft)] px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-[var(--teal)]">
                      {isOrderStatus(order.status)
                        ? t(`status.${order.status}`)
                        : order.status}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/cart"
            className="mt-6 inline-flex text-sm font-semibold text-[var(--teal)] hover:underline"
          >
            {t("goCart")} →
          </Link>
        </>
      )}
    </CustomerShell>
  );
}
