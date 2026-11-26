"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCustomer } from "@/components/providers/CustomerProvider";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { useToast } from "@/components/ui/Toaster";
import { StatusPill } from "@/components/admin/AdminBits";
import { CustomerShell } from "./CustomerShell";
import { isOrderStatus } from "@/lib/order-status";

const STEPS = ["placed", "packed", "shipped", "delivered"] as const;

export function CustomerOrders() {
  const t = useTranslations("Customer");
  const { user } = useAuth();
  const { format } = useCurrency();
  const toast = useToast();
  const { orders, ready, refreshOrders, cancelOrder } = useCustomer();
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Pick up status changes made by sellers/admin since the provider loaded.
  useEffect(() => {
    void refreshOrders().catch(() => undefined);
  }, [refreshOrders]);

  if (!user) return null;

  async function onCancel(orderId: string) {
    if (!confirm(t("cancelConfirm", { id: orderId }))) return;
    setBusyId(orderId);
    try {
      await cancelOrder(orderId);
      toast.success(t("cancelled"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("saveFailed"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <CustomerShell title={t("ordersTitle")} subtitle={t("ordersSub")}>
      {!ready ? (
        <PremiumLoader variant="panel" label={t("loading")} />
      ) : orders.length === 0 ? (
        <p className="rounded-xl border border-[var(--line)] bg-[var(--mist)]/40 px-4 py-8 text-[var(--muted)]">
          {t("ordersEmpty")}
        </p>
      ) : (
        <>
          <ul className="grid gap-3">
            {orders.map((order) => {
              const open = openId === order.id;
              const stepIndex = STEPS.indexOf(order.status as (typeof STEPS)[number]);
              return (
                <li key={order.id} className="rounded-xl border border-[var(--line)] bg-[var(--cream)]/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <button
                      type="button"
                      className="min-w-0 text-left"
                      onClick={() => setOpenId(open ? null : order.id)}
                      aria-expanded={open}
                    >
                      <p className="font-semibold">{order.id}</p>
                      <p className="text-sm text-[var(--muted)]">
                        {order.placedAt} · {order.itemCount} {t("items")} · {order.payment}
                      </p>
                      <p className="mt-1 text-sm">{order.summary}</p>
                    </button>
                    <div className="text-right">
                      <p className="font-semibold">{format(order.totalPkr)}</p>
                      <p className="mt-1">
                        <StatusPill
                          status={order.status}
                          label={isOrderStatus(order.status) ? t(`status.${order.status}`) : order.status}
                        />
                      </p>
                      {order.status === "placed" ? (
                        <button
                          type="button"
                          disabled={busyId === order.id}
                          onClick={() => void onCancel(order.id)}
                          className="mt-2 text-xs font-semibold text-[var(--sale)] hover:underline disabled:opacity-50"
                        >
                          {t("cancelOrder")}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {open ? (
                    <div className="mt-4 grid gap-4 border-t border-[var(--line)] pt-4 text-sm">
                      {order.status !== "cancelled" ? (
                        <ol className="grid grid-cols-4 gap-2 text-center text-[0.7rem] font-semibold uppercase tracking-wide">
                          {STEPS.map((step, i) => (
                            <li key={step} className="grid gap-1.5">
                              <span
                                className={`h-1.5 rounded-full ${
                                  i <= stepIndex ? "bg-[var(--teal)]" : "bg-[var(--line)]"
                                }`}
                              />
                              <span className={i <= stepIndex ? "text-[var(--teal)]" : "text-[var(--muted)]"}>
                                {t(`status.${step}`)}
                              </span>
                            </li>
                          ))}
                        </ol>
                      ) : null}
                      {order.lines?.length ? (
                        <ul className="grid gap-1">
                          {order.lines.map((line) => (
                            <li key={line.id ?? line.name} className="flex justify-between gap-2">
                              <span>
                                {line.name} × {line.qty}
                              </span>
                              <span>{format(line.pricePkr * line.qty)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      <p className="text-xs text-[var(--muted)]">
                        <strong>{t("deliverTo")}:</strong> {order.addressLabel}
                      </p>
                    </div>
                  ) : null}
                </li>
              );
            })}
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
