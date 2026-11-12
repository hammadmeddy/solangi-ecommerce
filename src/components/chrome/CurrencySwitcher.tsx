"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { UiDropdown } from "@/components/ui/UiDropdown";
import type { CurrencyCode } from "@/lib/currency";

export function CurrencySwitcher({
  variant = "desktop",
}: {
  variant?: "desktop" | "mobile";
}) {
  const t = useTranslations("Header");
  const { currency, setCurrency, currencies } = useCurrency();

  const options = useMemo(
    () =>
      currencies.map((code) => ({
        value: code,
        label: code,
      })),
    [currencies],
  );

  return (
    <UiDropdown
      ariaLabel={t("currency")}
      label={t("currency")}
      value={currency}
      options={options}
      onChange={(next) => setCurrency(next as CurrencyCode)}
      variant={variant === "mobile" ? "compact" : "header"}
    />
  );
}
