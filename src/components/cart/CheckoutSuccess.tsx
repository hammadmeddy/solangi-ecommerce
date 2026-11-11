"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/components/providers/CartProvider";
import { useCurrency } from "@/components/providers/CurrencyProvider";

export function CheckoutSuccess() {
  const t = useTranslations("Cart");
  const search = useSearchParams();
  const orderId = search.get("order");
  const { placedOrders } = useCart();
  const { format } = useCurrency();

  const order = useMemo(
    () => placedOrders.find((o) => o.id === orderId) ?? placedOrders[0],
    [placedOrders, orderId],
  );

  return (
    <section className="wrap py-14 md:py-20">
      <div className="mx-auto max-w-xl rounded-2xl border border-[var(--line)] bg-white/85 p-8 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gold)]">
          {t("successEyebrow")}
        </p>
        <h1 className="font-display mb-3 text-3xl font-semibold">{t("successTitle")}</h1>
        <p className="mb-6 text-[var(--muted)]">{t("successBody")}</p>
        {order ? (
          <div className="mb-8 rounded-xl border border-[var(--line)] bg-[var(--cream)]/70 px-4 py-4 text-left text-sm">
            <p>
              <strong>{t("orderId")}:</strong> {order.id}
            </p>
            <p>
              <strong>{t("payment")}:</strong> {order.payment}
            </p>
            <p>
              <strong>{t("delivery")}:</strong> {order.addressLabel}
            </p>
            <p>
              <strong>{t("total")}:</strong> {format(order.totalPkr)}
            </p>
            <p className="mt-2 text-[var(--muted)]">{order.summary}</p>
          </div>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/account/orders"
            className="inline-flex items-center justify-center rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-[var(--cream)] hover:bg-[var(--teal)]"
          >
            {t("viewOrders")}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-[var(--line)] px-5 py-3 text-sm font-semibold hover:border-[var(--teal)]"
          >
            {t("continueShop")}
          </Link>
        </div>
      </div>
    </section>
  );
}
