"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import { useCustomer } from "@/components/providers/CustomerProvider";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { AuthButton } from "@/components/auth/AuthField";

const PAYMENTS = [
  { id: "COD", live: true },
  { id: "Card", live: false },
  { id: "JazzCash", live: false },
  { id: "EasyPaisa", live: false },
  { id: "Bank", live: false },
] as const;

export function CheckoutView() {
  const t = useTranslations("Cart");
  const { user, ready: authReady } = useAuth();
  const { ready, lines, subtotalPkr, placeOrder } = useCart();
  const { addresses, ready: customerReady } = useCustomer();
  const { format } = useCurrency();
  const router = useRouter();
  const [addressId, setAddressId] = useState("");
  const [payment, setPayment] = useState<"COD">("COD");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authReady && !user) router.replace("/auth/login");
  }, [authReady, user, router]);

  useEffect(() => {
    if (ready && lines.length === 0) router.replace("/cart");
  }, [ready, lines.length, router]);

  useEffect(() => {
    if (!customerReady) return;
    const def = addresses.find((a) => a.isDefault) ?? addresses[0];
    if (def) setAddressId(def.id);
  }, [customerReady, addresses]);

  const selected = useMemo(
    () => addresses.find((a) => a.id === addressId),
    [addresses, addressId],
  );

  if (!authReady || !ready || !user) {
    return (
      <section className="wrap py-16">
        <p className="text-[var(--muted)]">{t("loading")}</p>
      </section>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selected) {
      setError(t("needAddress"));
      return;
    }
    if (payment !== "COD") {
      setError(t("codOnly"));
      return;
    }
    const summary = lines.map((l) => `${l.name} × ${l.qty}`).join(" · ");
    const order = await placeOrder({
      addressLabel: `${selected.label} — ${selected.city}`,
      summary: summary.slice(0, 120),
    });
    router.push(`/checkout/success?order=${order.id}`);
  }

  return (
    <section className="wrap py-10 md:py-14">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gold)]">
        {t("checkoutEyebrow")}
      </p>
      <h1 className="font-display mb-2 text-[clamp(2rem,4vw,2.75rem)] font-semibold">
        {t("checkoutTitle")}
      </h1>
      <p className="mb-8 max-w-[48ch] text-[var(--muted)]">{t("checkoutSub")}</p>

      <form className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]" onSubmit={onSubmit}>
        <div className="grid gap-6">
          <fieldset className="rounded-2xl border border-[var(--line)] bg-white/80 p-5">
            <legend className="px-1 font-display text-xl font-semibold">{t("delivery")}</legend>
            {addresses.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--muted)]">
                {t("noAddress")}{" "}
                <Link href="/account/addresses" className="font-semibold text-[var(--teal)] hover:underline">
                  {t("addAddress")}
                </Link>
              </p>
            ) : (
              <div className="mt-3 grid gap-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex cursor-pointer gap-3 rounded-xl border px-3 py-3 text-sm ${
                      addressId === addr.id
                        ? "border-[var(--ink)] bg-[var(--mist)]/50"
                        : "border-[var(--line)] bg-[var(--cream)]/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={addressId === addr.id}
                      onChange={() => setAddressId(addr.id)}
                      className="mt-1"
                    />
                    <span>
                      <strong>{addr.label}</strong>
                      {addr.isDefault ? ` · ${t("default")}` : ""}
                      <br />
                      <span className="text-[var(--muted)]">
                        {addr.fullName}, {addr.line1}
                        {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          <fieldset className="rounded-2xl border border-[var(--line)] bg-white/80 p-5">
            <legend className="px-1 font-display text-xl font-semibold">{t("payment")}</legend>
            <p className="mt-2 text-sm text-[var(--muted)]">{t("paymentNote")}</p>
            <div className="mt-3 grid gap-2">
              {PAYMENTS.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center justify-between rounded-xl border px-3 py-3 text-sm ${
                    method.live
                      ? payment === "COD"
                        ? "border-[var(--ink)] bg-[var(--mist)]/50"
                        : "border-[var(--line)]"
                      : "border-[var(--line)] opacity-60"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      disabled={!method.live}
                      checked={method.live && payment === "COD"}
                      onChange={() => {
                        if (method.live) setPayment("COD");
                      }}
                    />
                    <strong>{method.id}</strong>
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    {method.live ? t("available") : t("later")}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <aside className="h-fit rounded-2xl border border-[var(--line)] bg-white/80 p-5 md:p-6">
          <h2 className="font-display mb-4 text-xl font-semibold">{t("summary")}</h2>
          <ul className="mb-4 grid gap-2 text-sm">
            {lines.map((line) => (
              <li key={line.productId} className="flex justify-between gap-3">
                <span className="text-[var(--muted)]">
                  {line.name} × {line.qty}
                </span>
                <span className="font-medium">{format(line.pricePkr * line.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mb-2 flex justify-between border-t border-[var(--line)] pt-3 text-sm">
            <span className="text-[var(--muted)]">{t("subtotal")}</span>
            <span className="font-bold">{format(subtotalPkr)}</span>
          </div>
          <p className="mb-5 text-xs text-[var(--muted)]">{t("codConfirm")}</p>
          {error ? <p className="mb-3 text-sm text-[var(--sale)]">{error}</p> : null}
          <AuthButton type="submit">{t("placeOrder")}</AuthButton>
          <Link
            href="/cart"
            className="mt-3 inline-flex w-full justify-center text-sm font-semibold text-[var(--teal)] hover:underline"
          >
            {t("backCart")}
          </Link>
        </aside>
      </form>
    </section>
  );
}
