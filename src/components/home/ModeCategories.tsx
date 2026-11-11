"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Building2,
  RefreshCw,
  ShoppingBag,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { CATEGORIES, MODES, type ModeId } from "@/lib/categories";
import { CategoryMedia } from "@/components/media/CategoryIcon";

const MODE_ICONS: Record<ModeId, LucideIcon> = {
  retail: ShoppingBag,
  wholesale: Building2,
  used: RefreshCw,
  services: Wrench,
};

export function ModeCategories() {
  const t = useTranslations("Modes");
  const router = useRouter();
  const [active, setActive] = useState<ModeId>("retail");
  const blurbs: Record<ModeId, string> = {
    retail: t("retailBlurb"),
    wholesale: t("wholesaleBlurb"),
    used: t("usedBlurb"),
    services: t("servicesBlurb"),
  };

  function selectMode(mode: ModeId) {
    setActive(mode);
    if (mode === "retail") return;
    router.push(`/mode/${mode}`);
  }

  return (
    <div id="top" className="border-b border-[var(--line)] bg-white/55">
      <div className="wrap py-4 md:py-5">
        <div
          className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3"
          role="tablist"
          aria-label="Marketplace modes"
        >
          {MODES.map((mode) => {
            const selected = active === mode.id;
            const Icon = MODE_ICONS[mode.id];
            return (
              <button
                key={mode.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => selectMode(mode.id)}
                className={`group relative flex min-h-[5.5rem] w-full flex-col justify-between overflow-hidden rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 md:min-h-[6.25rem] md:px-5 md:py-4 ${
                  selected
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--cream)] shadow-[0_16px_36px_rgba(12,36,33,0.22)]"
                    : "border-[var(--line)] bg-gradient-to-br from-white to-[var(--mist)]/70 text-[var(--ink-soft)] hover:-translate-y-0.5 hover:border-[var(--teal)]/40 hover:shadow-[0_12px_28px_rgba(12,36,33,0.08)]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`mb-1 block text-[0.65rem] font-semibold uppercase tracking-[0.16em] ${
                        selected ? "text-[var(--gold-light)]" : "text-[var(--gold)]"
                      }`}
                    >
                      {mode.sub}
                    </span>
                    <span className="block text-[1.05rem] font-semibold leading-tight md:text-[1.15rem]">
                      {t(mode.id)}
                    </span>
                  </div>
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors ${
                      selected
                        ? "bg-[var(--gold)] text-[var(--ink)]"
                        : "bg-[var(--teal-soft)] text-[var(--teal)] group-hover:bg-[var(--teal)] group-hover:text-[var(--cream)]"
                    }`}
                  >
                    <Icon size={20} strokeWidth={1.75} />
                  </span>
                </div>
                <p
                  className={`mt-2 text-[0.78rem] leading-snug ${
                    selected ? "text-[rgba(247,244,238,0.78)]" : "text-[var(--muted)]"
                  }`}
                >
                  {blurbs[mode.id]}
                </p>
                {selected ? (
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-[var(--gold)]" />
                ) : null}
              </button>
            );
          })}
        </div>

        <nav
          className="hide-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1 pt-1 snap-x snap-mandatory"
          aria-label="Product categories"
        >
          {CATEGORIES.map((cat) => {
            let href = `/category/${cat.id}`;
            if (cat.href === "services-mode" || active === "services") {
              href = `/mode/services${cat.id !== "services" ? `?cat=${cat.id}` : ""}`;
            } else if (active !== "retail") {
              href = `/mode/${active}?cat=${cat.id}`;
            }
            return (
              <Link
                key={cat.id}
                href={href}
                className="w-[104px] shrink-0 snap-start text-center transition-transform hover:-translate-y-0.5"
              >
                <CategoryMedia
                  categoryId={cat.id}
                  label={cat.name}
                  size="sm"
                  className="mb-1.5 aspect-square rounded-[14px] border border-[var(--line)]"
                />
                <p className="text-[0.72rem] font-medium leading-tight text-[var(--ink-soft)]">
                  {cat.name}
                </p>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
