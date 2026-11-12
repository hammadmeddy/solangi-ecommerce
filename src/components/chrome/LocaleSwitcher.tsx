"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { UiDropdown } from "@/components/ui/UiDropdown";

export function LocaleSwitcher({
  variant = "desktop",
}: {
  variant?: "desktop" | "mobile";
}) {
  const t = useTranslations("Header");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const options = useMemo(
    () =>
      routing.locales.map((code) => ({
        value: code,
        label: code.toUpperCase(),
      })),
    [],
  );

  function onChange(next: string) {
    router.replace(pathname, { locale: next });
  }

  return (
    <UiDropdown
      ariaLabel={t("lang")}
      label={variant === "mobile" ? "EN / UR" : t("lang")}
      value={locale}
      options={options}
      onChange={onChange}
      variant={variant === "mobile" ? "compact" : "header"}
    />
  );
}
