"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCustomer } from "@/components/providers/CustomerProvider";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { CustomerShell } from "./CustomerShell";

export function CustomerWishlist() {
  const t = useTranslations("Customer");
  const { user } = useAuth();
  const { wishlist, removeWishlist, ready } = useCustomer();
  const { format } = useCurrency();

  if (!user) return null;

  return (
    <CustomerShell title={t("wishlistTitle")} subtitle={t("wishlistSub")}>
      {!ready ? (
        <p className="text-[var(--muted)]">{t("loading")}</p>
      ) : wishlist.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--line)] px-5 py-10 text-center">
          <p className="mb-3 text-[var(--muted)]">{t("wishlistEmpty")}</p>
          <Link
            href="/"
            className="inline-flex rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-[var(--cream)] hover:bg-[var(--teal)]"
          >
            {t("continueShop")}
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {wishlist.map((item) => (
            <li key={item.productId} className="rounded-xl border border-[var(--line)] bg-[var(--cream)]/60 p-4">
              <p className="text-[0.68rem] uppercase tracking-wider text-[var(--muted)]">{item.category}</p>
              <p className="mt-1 font-semibold">{item.name}</p>
              <p className="mt-1 font-bold">{format(item.pricePkr)}</p>
              <div className="mt-3 flex gap-3">
                <Link
                  href={`/product/${item.productId}`}
                  className="text-sm font-semibold text-[var(--teal)] hover:underline"
                >
                  {t("viewProduct")}
                </Link>
                <button
                  type="button"
                  className="text-sm font-semibold text-[var(--sale)]"
                  onClick={() => removeWishlist(item.productId)}
                >
                  {t("remove")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </CustomerShell>
  );
}
