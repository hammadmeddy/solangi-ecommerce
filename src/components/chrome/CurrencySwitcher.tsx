"use client";

import { useTranslations } from "next-intl";
import { useCurrency } from "@/components/providers/CurrencyProvider";

export function CurrencySwitcher({
  variant = "desktop",
}: {
  variant?: "desktop" | "mobile";
}) {
  const t = useTranslations("Header");
  const { currency, setCurrency, currencies } = useCurrency();

  if (variant === "mobile") {
    return (
      <label className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium">
        <span className="text-[0.72rem] uppercase tracking-wider text-[var(--muted)]">
          {t("currency")}
        </span>
        <select
          aria-label={t("currency")}
          className="bg-transparent outline-none"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as typeof currency)}
        >
          {currencies.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[0.8125rem] font-medium hover:border-[var(--line)] hover:bg-white/70 border border-transparent cursor-pointer">
      <span className="hidden sm:inline">{t("currency")}</span>
      <select
        aria-label={t("currency")}
        className="bg-transparent outline-none cursor-pointer font-medium"
        value={currency}
        onChange={(e) => setCurrency(e.target.value as typeof currency)}
      >
        {currencies.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
    </label>
  );
}
