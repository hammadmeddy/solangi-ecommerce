import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";

export async function Reviews() {
  const t = await getTranslations("Reviews");

  let items: { id: string; quote: string; author: string; meta: string; rating: number }[] =
    [];
  try {
    const rows = await prisma.review.findMany({
      where: { status: "approved" },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 6,
    });
    items = rows.map((r) => ({
      id: r.id,
      quote: r.quote,
      author: r.author,
      meta: r.meta,
      rating: r.rating,
    }));
  } catch {
    items = [];
  }

  return (
    <section id="reviews" className="border-y border-[var(--line)] bg-white/40 py-14">
      <div className="wrap">
        <div className="mb-6">
          <h2 className="font-display text-[clamp(1.8rem,3vw,2.35rem)] font-semibold leading-tight">
            {t("title")}
          </h2>
          <p className="mt-1 max-w-[40ch] text-[0.95rem] text-[var(--muted)]">{t("sub")}</p>
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">{t("empty")}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-[var(--line)] bg-white px-5 py-5"
              >
                <div className="mb-2 text-[0.75rem] tracking-wide text-[var(--gold)]">
                  {"★".repeat(Math.max(1, Math.min(5, item.rating)))}
                </div>
                <blockquote className="font-display mb-4 text-[1.2rem] italic leading-snug text-[var(--ink-soft)]">
                  “{item.quote}”
                </blockquote>
                <footer className="text-[0.8rem] text-[var(--muted)]">
                  <strong className="mb-0.5 block text-[var(--ink)] not-italic">
                    {item.author}
                  </strong>
                  {item.meta}
                </footer>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
