"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher({
  variant = "desktop",
}: {
  variant?: "desktop" | "mobile";
}) {
  const t = useTranslations("Header");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onChange(next: string) {
    router.replace(pathname, { locale: next });
  }

  if (variant === "mobile") {
    return (
      <label className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium">
        <span className="text-[0.72rem] uppercase tracking-wider text-[var(--muted)]">
          EN / UR
        </span>
        <select
          aria-label={t("lang")}
          className="bg-transparent outline-none"
          value={locale}
          onChange={(e) => onChange(e.target.value)}
        >
          {routing.locales.map((code) => (
            <option key={code} value={code}>
              {code.toUpperCase()}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[0.8125rem] font-medium hover:border-[var(--line)] hover:bg-white/70 border border-transparent cursor-pointer">
      <span className="hidden sm:inline">{t("lang")}</span>
      <select
        aria-label={t("lang")}
        className="bg-transparent outline-none cursor-pointer font-medium"
        value={locale}
        onChange={(e) => onChange(e.target.value)}
      >
        {routing.locales.map((code) => (
          <option key={code} value={code}>
            {code.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
