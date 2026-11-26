"use client";

import type { ReactNode } from "react";

/** Small shared pieces for the admin and seller panels. */

export const inputClass =
  "rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--teal)]";

export const primaryBtn =
  "rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-[var(--cream)] disabled:opacity-50";

export const ghostBtn =
  "rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold hover:border-[var(--teal)] disabled:opacity-50";

export const dangerBtn =
  "rounded-full border border-[var(--sale)] px-4 py-2 text-sm font-semibold text-[var(--sale)] disabled:opacity-50";

const TONES: Record<string, string> = {
  good: "bg-[var(--teal-soft)] text-[var(--teal)]",
  warn: "bg-amber-100 text-amber-800",
  bad: "bg-red-100 text-[var(--sale)]",
  neutral: "bg-[var(--mist)] text-[var(--ink-soft)]",
};

const STATUS_TONE: Record<string, keyof typeof TONES> = {
  active: "good",
  approved: "good",
  delivered: "good",
  paid: "good",
  pending: "warn",
  placed: "warn",
  packed: "neutral",
  shipped: "neutral",
  draft: "neutral",
  out: "neutral",
  rejected: "bad",
  suspended: "bad",
  cancelled: "bad",
};

export function StatusPill({ status, label }: { status: string; label?: string }) {
  const tone = TONES[STATUS_TONE[status] ?? "neutral"];
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide ${tone}`}
    >
      {label ?? status}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--mist)]/50 px-4 py-3">
      <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-semibold text-[var(--ink)]">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}

export function FilterTabs<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string; count?: number }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
            value === o.value
              ? "bg-[var(--ink)] text-[var(--cream)]"
              : "border border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--teal)]"
          }`}
        >
          {o.label}
          {o.count ? <span className="ml-1.5 opacity-70">{o.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-[var(--line)] bg-[var(--mist)]/40 px-4 py-8 text-[var(--muted)]">
      {children}
    </p>
  );
}
