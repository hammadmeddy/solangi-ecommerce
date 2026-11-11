"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck, Store, Handshake } from "lucide-react";

export function WhyChooseUs() {
  const t = useTranslations("Why");
  const points = [
    { t: t("1t"), p: t("1p") },
    { t: t("2t"), p: t("2p") },
    { t: t("3t"), p: t("3p") },
  ];

  return (
    <section id="why" className="py-14">
      <div className="wrap grid items-center gap-10 md:grid-cols-[1.1fr_1fr]">
        <div>
          <h2 className="font-display mb-3 text-[clamp(2rem,3.5vw,2.75rem)] leading-tight">
            {t("title")}
          </h2>
          <p className="mb-6 max-w-[42ch] text-[var(--muted)]">{t("sub")}</p>
          <div className="grid gap-4">
            {points.map((point, i) => (
              <article key={point.t} className="grid grid-cols-[auto_1fr] gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--teal-soft)] text-sm font-bold text-[var(--teal)]">
                  {i + 1}
                </div>
                <div>
                  <h3 className="mb-0.5 text-base font-semibold">{point.t}</h3>
                  <p className="text-[0.88rem] text-[var(--muted)]">{point.p}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div
          className="relative grid min-h-[320px] place-items-center overflow-hidden rounded-[18px] border border-[var(--line)] p-8 text-center"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(184,146,62,0.2), transparent 45%), linear-gradient(160deg, #dceae5, #f3efe6 70%)",
          }}
        >
          <div className="absolute inset-[12%] rounded-xl border border-[rgba(12,36,33,0.08)]" />
          <div className="relative flex items-center gap-4 text-[var(--ink)]">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-[var(--ink)] text-[var(--cream)]">
              <Store size={28} strokeWidth={1.6} />
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--gold)] text-[var(--ink)]">
              <Handshake size={24} strokeWidth={1.6} />
            </div>
            <div className="grid h-16 w-16 place-items-center rounded-full bg-[var(--teal)] text-[var(--cream)]">
              <ShieldCheck size={28} strokeWidth={1.6} />
            </div>
          </div>
          <p className="relative mt-6 max-w-[24ch] text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
            {t("visualPh")}
          </p>
        </div>
      </div>
    </section>
  );
}
