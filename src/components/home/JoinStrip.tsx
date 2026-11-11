import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function JoinStrip() {
  const t = useTranslations("Join");

  const cards = [
    { num: "01", title: t("customer"), body: t("customerP"), href: "/auth/register" as const, live: true },
    { num: "02", title: t("seller"), body: t("sellerP"), href: "/auth/register" as const, live: true },
    { num: "03", title: t("affiliate"), body: t("affiliateP"), href: "/affiliate" as const, live: false },
    { num: "04", title: t("mlm"), body: t("mlmP"), href: "/mlm" as const, live: false },
    { num: "05", title: t("investor"), body: t("investorP"), href: "/investor" as const, live: false },
  ];

  return (
    <section
      id="join"
      className="relative overflow-hidden py-12 text-[var(--cream)]"
      style={{
        background: "linear-gradient(120deg, var(--ink) 0%, #144039 55%, #1a4d44 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute -top-[20%] right-[10%] h-[420px] w-[420px]"
        style={{
          background: "radial-gradient(circle, rgba(184,146,62,0.28), transparent 65%)",
        }}
        aria-hidden
      />
      <div className="wrap relative">
        <div className="mb-6">
          <h2 className="font-display text-[clamp(1.8rem,3vw,2.35rem)] font-semibold text-white">
            {t("title")}
          </h2>
          <p className="mt-1 max-w-[48ch] text-[0.95rem] text-[rgba(247,244,238,0.7)]">
            {t("sub")}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map((card) => (
            <Link
              key={card.num}
              href={card.href}
              className="flex min-h-[160px] flex-col gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] p-4 transition hover:-translate-y-0.5 hover:border-[rgba(232,213,163,0.45)] hover:bg-white/[0.08]"
            >
              <span className="font-display text-2xl leading-none text-[var(--gold-light)]">
                {card.num}
              </span>
              <h3 className="text-[1.05rem] font-semibold">{card.title}</h3>
              <p className="flex-1 text-[0.8rem] text-[rgba(247,244,238,0.68)]">{card.body}</p>
              <span
                className={`text-[0.68rem] font-semibold uppercase tracking-wider ${
                  card.live ? "text-[#8fd6c4]" : "text-[var(--gold-light)]"
                }`}
              >
                {card.live ? t("open") : t("holding")}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
