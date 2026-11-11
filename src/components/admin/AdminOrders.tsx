"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminShell } from "./AdminShell";
import { PLACED_ORDERS_KEY, type PlacedOrder } from "@/lib/cart";
import { useCurrency } from "@/components/providers/CurrencyProvider";

export function AdminOrders() {
  const t = useTranslations("Admin");
  const { format } = useCurrency();
  const [orders, setOrders] = useState<PlacedOrder[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/orders", { credentials: "include", cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as { orders: PlacedOrder[] };
          if (!cancelled && data.orders?.length) {
            setOrders(data.orders);
            return;
          }
        }
      } catch {
        /* fall through */
      }
      try {
        const raw = localStorage.getItem(PLACED_ORDERS_KEY);
        if (!cancelled && raw) setOrders(JSON.parse(raw) as PlacedOrder[]);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AdminShell title={t("ordersTitle")} subtitle={t("ordersSub")}>
      {orders.length === 0 ? (
        <p className="rounded-xl border border-[var(--line)] bg-[var(--mist)]/40 px-4 py-8 text-[var(--muted)]">
          {t("ordersEmpty")}
        </p>
      ) : (
        <div className="grid gap-3">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-xl border border-[var(--line)] bg-[var(--cream)]/50 p-4"
            >
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">{order.id}</h2>
                <span className="text-sm font-bold">{format(order.totalPkr)}</span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                {order.placedAt} · {order.payment} · {order.itemCount} items · {order.status}
              </p>
              <p className="mt-2 text-sm">{order.summary}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{order.addressLabel}</p>
            </article>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
