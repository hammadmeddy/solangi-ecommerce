"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/components/providers/CartProvider";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { AuthButton } from "@/components/auth/AuthField";

export function CartView() {
  const t = useTranslations("Cart");
  const { ready, lines, subtotalPkr, setQty, removeLine } = useCart();
  const { format } = useCurrency();

  if (!ready) {
    return (
      <section className="wrap py-16">
        <p className="text-[var(--muted)]">{t("loading")}</p>
      </section>
    );
  }

  return (
    <section className="wrap py-10 md:py-14">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gold)]">
        {t("eyebrow")}
      </p>
      <h1 className="font-display mb-2 text-[clamp(2rem,4vw,2.75rem)] font-semibold">
        {t("title")}
      </h1>
      <p className="mb-8 max-w-[48ch] text-[var(--muted)]">{t("sub")}</p>

      {lines.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/70 px-6 py-12 text-center">
          <p className="mb-4 text-[var(--muted)]">{t("empty")}</p>
          <Link
            href="/"
            className="inline-flex rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-[var(--cream)] hover:bg-[var(--teal)]"
          >
            {t("continueShop")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <ul className="grid gap-3">
            {lines.map((line) => (
              <li
                key={line.productId}
                className="rounded-2xl border border-[var(--line)] bg-white/80 p-4 md:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-wider text-[var(--muted)]">
                      {line.category}
                    </p>
                    <Link
                      href={`/product/${line.productId}`}
                      className="font-semibold hover:text-[var(--teal)]"
                    >
                      {line.name}
                    </Link>
                    <p className="mt-1 font-bold">{format(line.pricePkr)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <span className="text-[var(--muted)]">{t("qty")}</span>
                      <input
                        type="number"
                        min={1}
                        value={line.qty}
                        onChange={(e) => setQty(line.productId, Number(e.target.value) || 1)}
                        className="w-16 rounded-lg border border-[var(--line)] bg-[var(--cream)] px-2 py-1.5 outline-none focus:border-[var(--teal)]"
                      />
                    </label>
                    <button
                      type="button"
                      className="text-sm font-semibold text-[var(--sale)]"
                      onClick={() => removeLine(line.productId)}
                    >
                      {t("remove")}
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {t("lineTotal")}: {format(line.pricePkr * line.qty)}
                </p>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-2xl border border-[var(--line)] bg-white/80 p-5 md:p-6">
            <h2 className="font-display mb-4 text-xl font-semibold">{t("summary")}</h2>
            <div className="mb-4 flex justify-between text-sm">
              <span className="text-[var(--muted)]">{t("subtotal")}</span>
              <span className="font-bold">{format(subtotalPkr)}</span>
            </div>
            <p className="mb-5 text-xs text-[var(--muted)]">{t("shippingNote")}</p>
            <Link href="/checkout" className="block">
              <AuthButton type="button">{t("checkout")}</AuthButton>
            </Link>
            <Link
              href="/"
              className="mt-3 inline-flex w-full justify-center text-sm font-semibold text-[var(--teal)] hover:underline"
            >
              {t("continueShop")}
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}
