"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminShell } from "./AdminShell";
import { EmptyState, FilterTabs, StatusPill, inputClass } from "./AdminBits";
import type { PlacedOrder } from "@/lib/cart";
import { ORDER_STATUSES, type OrderStatusValue } from "@/lib/order-status";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { UiDropdown } from "@/components/ui/UiDropdown";
import { useToast } from "@/components/ui/Toaster";
import { apiGet, apiSend } from "@/lib/api-client";

type Filter = "" | "open" | OrderStatusValue;

export function AdminOrders() {
  const t = useTranslations("Admin");
  const tc = useTranslations("Customer");
  const { format } = useCurrency();
  const toast = useToast();
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const [filter, setFilter] = useState<Filter>("open");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await apiGet<{ orders: PlacedOrder[] }>("/api/orders");
      setOrders(data.orders || []);
      setError("");
    } catch {
      setError(t("ordersLoadFailed"));
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter === "open" && !["placed", "packed", "shipped"].includes(o.status)) return false;
      if (filter && filter !== "open" && o.status !== filter) return false;
      if (!needle) return true;
      return [o.id, o.customerName, o.phone, o.summary, o.addressLabel]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(needle));
    });
  }, [orders, filter, q]);

  const count = (s: string) => orders.filter((o) => o.status === s).length;

  async function updateStatus(order: PlacedOrder, status: OrderStatusValue) {
    if (status === "cancelled" && !confirm(t("confirmCancelOrder", { id: order.id }))) return;
    setSavingId(order.id);
    try {
      const data = await apiSend<{ order: PlacedOrder }>(
        "PATCH",
        `/api/orders/${encodeURIComponent(order.id)}`,
        { status },
      );
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, ...data.order } : o)));
      toast.success(t("orderUpdated"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("ordersUpdateFailed"));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <AdminShell title={t("ordersTitle")} subtitle={t("ordersSub")}>
      {error ? <p className="mb-4 text-sm text-[var(--sale)]">{error}</p> : null}
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("ordersSearch")}
        aria-label={t("ordersSearch")}
        className={`${inputClass} mb-3 w-full`}
      />
      <FilterTabs<Filter>
        value={filter}
        onChange={setFilter}
        options={[
          { value: "open", label: t("filterOpen"), count: count("placed") + count("packed") + count("shipped") },
          ...ORDER_STATUSES.map((s) => ({ value: s, label: tc(`status.${s}`), count: count(s) })),
          { value: "", label: t("filterAll") },
        ]}
      />

      {visible.length === 0 ? (
        <EmptyState>{t("ordersEmpty")}</EmptyState>
      ) : (
        <div className="grid gap-3">
          {visible.map((order) => {
            const open = openId === order.id;
            return (
              <article key={order.id} className="rounded-xl border border-[var(--line)] bg-[var(--cream)]/50 p-4">
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : order.id)}
                    aria-expanded={open}
                    className="flex items-center gap-2 text-sm font-semibold"
                  >
                    {order.id}
                    <StatusPill status={order.status} label={tc(`status.${order.status}`)} />
                  </button>
                  <span className="text-sm font-bold">{format(order.totalPkr)}</span>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  {order.placedAt} · {order.payment} · {t("itemsCount", { n: order.itemCount })}
                  {order.customerName ? ` · ${order.customerName}` : ""}
                  {order.phone ? ` · ${order.phone}` : ""}
                </p>
                <p className="mt-2 text-sm">{order.summary}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{order.addressLabel}</p>

                {open && order.lines?.length ? (
                  <ul className="mt-3 grid gap-1 border-t border-[var(--line)] pt-3 text-xs">
                    {order.lines.map((line) => (
                      <li key={line.id ?? line.name} className="flex flex-wrap justify-between gap-2">
                        <span>
                          {line.name} × {line.qty}
                          {line.sellerId ? "" : ` · ${t("soldBySolangi")}`}
                        </span>
                        <span className="flex items-center gap-2">
                          {line.itemStatus && line.itemStatus !== order.status ? (
                            <StatusPill status={line.itemStatus} label={tc(`status.${line.itemStatus}`)} />
                          ) : null}
                          {format(line.pricePkr * line.qty)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <UiDropdown
                    variant="compact"
                    ariaLabel={t("orderStatus")}
                    label={t("orderStatus")}
                    value={order.status}
                    disabled={savingId === order.id || order.status === "cancelled"}
                    options={ORDER_STATUSES.map((status) => ({
                      value: status,
                      label: tc(`status.${status}`),
                    }))}
                    onChange={(next) => void updateStatus(order, next as OrderStatusValue)}
                  />
                  {savingId === order.id ? (
                    <span className="text-xs text-[var(--muted)]">{t("saving")}</span>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
