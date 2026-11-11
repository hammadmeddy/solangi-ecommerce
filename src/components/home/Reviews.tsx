import { useTranslations } from "next-intl";

export function Reviews() {
  const t = useTranslations("Reviews");
  const items = [
    { q: t("r1"), a: t("r1a"), m: t("r1m") },
    { q: t("r2"), a: t("r2a"), m: t("r2m") },
    { q: t("r3"), a: t("r3a"), m: t("r3m") },
  ];

  return (
    <section id="reviews" className="border-y border-[var(--line)] bg-white/40 py-14">
      <div className="wrap">
        <div className="mb-6">
          <h2 className="font-display text-[clamp(1.8rem,3vw,2.35rem)] font-semibold leading-tight">
            {t("title")}
          </h2>
          <p className="mt-1 max-w-[40ch] text-[0.95rem] text-[var(--muted)]">{t("sub")}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.a}
              className="rounded-xl border border-[var(--line)] bg-white px-5 py-5"
            >
              <div className="mb-2 text-[0.75rem] tracking-wide text-[var(--gold)]">★★★★★</div>
              <blockquote className="font-display mb-4 text-[1.2rem] italic leading-snug text-[var(--ink-soft)]">
                “{item.q}”
              </blockquote>
              <footer className="text-[0.8rem] text-[var(--muted)]">
                <strong className="mb-0.5 block text-[var(--ink)] not-italic">{item.a}</strong>
                {item.m}
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
