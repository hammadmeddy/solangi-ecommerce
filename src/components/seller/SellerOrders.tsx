"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSeller } from "@/components/providers/SellerProvider";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { useToast } from "@/components/ui/Toaster";
import { EmptyState, FilterTabs, StatusPill } from "@/components/admin/AdminBits";
import { SellerShell } from "./SellerShell";

type Tab = "open" | "done" | "all";

export function SellerOrders() {
  const t = useTranslations("Seller");
  const tc = useTranslations("Customer");
  const { user } = useAuth();
  const { orders, ready, advanceOrder } = useSeller();
  const { format } = useCurrency();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("open");
  const [busyId, setBusyId] = useState<string | null>(null);

  if (!user || user.role !== "seller") {
    return (
      <SellerShell title={t("ordersTitle")} subtitle={t("ordersSub")}>
        <PremiumLoader variant="panel" label={t("loading")} />
      </SellerShell>
    );
  }

  const isOpen = (s: string) => s === "placed" || s === "packed" || s === "shipped";
  const visible = orders.filter((o) =>
    tab === "all" ? true : tab === "open" ? isOpen(o.orderStatus) : !isOpen(o.orderStatus),
  );

  async function move(orderId: string, status: "packed" | "shipped") {
    setBusyId(orderId);
    try {
      await advanceOrder(orderId, status);
      toast.success(t("orderMoved", { status: tc(`status.${status}`) }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("saveFailed"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <SellerShell title={t("ordersTitle")} subtitle={t("ordersSub")}>
      {!ready ? (
        <PremiumLoader variant="panel" label={t("loading")} />
      ) : (
        <>
          <FilterTabs<Tab>
            value={tab}
            onChange={setTab}
            options={[
              { value: "open", label: t("tabOpen"), count: orders.filter((o) => isOpen(o.orderStatus)).length },
              { value: "done", label: t("tabDone") },
              { value: "all", label: t("tabAll") },
            ]}
          />
          <p className="mb-4 text-sm text-[var(--muted)]">{t("ordersFlowNote")}</p>
          {visible.length === 0 ? (
            <EmptyState>{t("ordersEmpty")}</EmptyState>
          ) : (
            <ul className="grid gap-3">
              {visible.map((order) => (
                <li key={order.id} className="rounded-xl border border-[var(--line)] bg-[var(--cream)]/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-semibold">
                        {order.id}
                        <StatusPill status={order.status} label={tc(`status.${order.status}`)} />
                      </p>
                      <p className="text-sm text-[var(--muted)]">
                        {order.placedAt} · {order.buyer}
                        {order.city ? ` · ${order.city}` : ""}
                      </p>
                      <ul className="mt-2 grid gap-0.5 text-sm">
                        {order.lines.map((line) => (
                          <li key={line.id}>
                            {line.name} × {line.qty} · {format(line.pricePkr * line.qty)}
                          </li>
                        ))}
                      </ul>
                      {order.address ? (
                        <p className="mt-2 text-xs text-[var(--ink-soft)]">
                          <strong>{t("shipTo")}:</strong> {order.address}
                          {order.phone ? ` · ${order.phone}` : ""}
                        </p>
                      ) : order.status === "placed" ? (
                        <p className="mt-2 text-xs text-[var(--muted)]">{t("addressAfterPack")}</p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{format(order.totalPkr)}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {t("youEarn")} {format(order.totalPkr - order.commissionPkr)}
                      </p>
                      <div className="mt-2 flex justify-end gap-2">
                        {order.status === "placed" ? (
                          <button
                            type="button"
                            disabled={busyId === order.id}
                            onClick={() => void move(order.id, "packed")}
                            className="rounded-full bg-[var(--ink)] px-3.5 py-1.5 text-xs font-semibold text-[var(--cream)] disabled:opacity-50"
                          >
                            {t("markPacked")}
                          </button>
                        ) : null}
                        {order.status === "packed" ? (
                          <button
                            type="button"
                            disabled={busyId === order.id}
                            onClick={() => void move(order.id, "shipped")}
                            className="rounded-full bg-[var(--ink)] px-3.5 py-1.5 text-xs font-semibold text-[var(--cream)] disabled:opacity-50"
                          >
                            {t("markShipped")}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </SellerShell>
  );
}
