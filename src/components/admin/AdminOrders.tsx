"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminShell } from "./AdminShell";
import type { PlacedOrder } from "@/lib/cart";
import { ORDER_STATUSES, type OrderStatusValue } from "@/lib/order-status";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { UiDropdown } from "@/components/ui/UiDropdown";
import { apiSend } from "@/lib/api-client";

export function AdminOrders() {
  const t = useTranslations("Admin");
  const tc = useTranslations("Customer");
  const { format } = useCurrency();
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/orders", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as { orders: PlacedOrder[] };
      setOrders(data.orders || []);
      setError("");
    } catch {
      setError(t("ordersLoadFailed"));
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateStatus(orderId: string, status: OrderStatusValue) {
    setSavingId(orderId);
    setError("");
    try {
      const data = await apiSend<{ order: PlacedOrder }>(
        "PATCH",
        `/api/orders/${encodeURIComponent(orderId)}`,
        { status },
      );
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...data.order } : o)),
      );
    } catch {
      setError(t("ordersUpdateFailed"));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <AdminShell title={t("ordersTitle")} subtitle={t("ordersSub")}>
      {error ? <p className="mb-4 text-sm text-[var(--sale)]">{error}</p> : null}
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
                {order.placedAt} · {order.payment} · {order.itemCount} items
                {order.customerName ? ` · ${order.customerName}` : ""}
                {order.phone ? ` · ${order.phone}` : ""}
              </p>
              <p className="mt-2 text-sm">{order.summary}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{order.addressLabel}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <UiDropdown
                  variant="compact"
                  ariaLabel={t("orderStatus")}
                  label={t("orderStatus")}
                  value={order.status}
                  disabled={savingId === order.id}
                  options={ORDER_STATUSES.map((status) => ({
                    value: status,
                    label: tc(`status.${status}`),
                  }))}
                  onChange={(next) =>
                    void updateStatus(order.id, next as OrderStatusValue)
                  }
                />
                {savingId === order.id ? (
                  <span className="text-xs text-[var(--muted)]">{t("saving")}</span>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
