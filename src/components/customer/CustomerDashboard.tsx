"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCustomer } from "@/components/providers/CustomerProvider";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { CustomerShell } from "./CustomerShell";

export function CustomerDashboard() {
  const t = useTranslations("Customer");
  const { user } = useAuth();
  const { orders, wishlist, addresses, ready } = useCustomer();
  const { format } = useCurrency();

  if (!user) return null;

  const openOrders = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled");

  return (
    <CustomerShell title={t("dashTitle", { name: user.name })} subtitle={t("dashSub")}>
      {!ready ? (
        <p className="text-[var(--muted)]">{t("loading")}</p>
      ) : (
        <>
          <div className="mb-8 grid gap-3 sm:grid-cols-3">
            <Stat label={t("statOrders")} value={String(orders.length)} />
            <Stat label={t("statOpen")} value={String(openOrders.length)} />
            <Stat label={t("statWishlist")} value={String(wishlist.length)} />
          </div>

          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-semibold">{t("recentOrders")}</h2>
              <Link href="/account/orders" className="text-sm font-semibold text-[var(--teal)] hover:underline">
                {t("viewAll")}
              </Link>
            </div>
            <ul className="grid gap-2">
              {orders.slice(0, 2).map((order) => (
                <li
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--line)] bg-[var(--cream)]/70 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold">{order.id}</p>
                    <p className="text-sm text-[var(--muted)]">{order.summary}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{format(order.totalPkr)}</p>
                    <p className="text-xs uppercase tracking-wide text-[var(--teal)]">
                      {t(`status.${order.status}`)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <QuickLink href="/account/profile" title={t("navProfile")} body={t("quickProfile")} />
            <QuickLink
              href="/account/addresses"
              title={t("navAddresses")}
              body={t("quickAddresses", { count: addresses.length })}
            />
            <QuickLink href="/account/wishlist" title={t("navWishlist")} body={t("quickWishlist")} />
            <QuickLink href="/" title={t("continueShop")} body={t("continueShopBody")} />
          </div>
        </>
      )}
    </CustomerShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--mist)]/50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold text-[var(--ink)]">{value}</p>
    </div>
  );
}

function QuickLink({
  href,
  title,
  body,
}: {
  href: "/" | "/account/profile" | "/account/addresses" | "/account/wishlist";
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-[var(--line)] bg-[var(--cream)]/60 px-4 py-4 transition hover:border-[var(--teal)]"
    >
      <p className="font-semibold text-[var(--ink)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{body}</p>
    </Link>
  );
}
