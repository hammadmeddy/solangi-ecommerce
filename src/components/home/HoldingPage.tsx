import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Props = {
  titleKey:
    | "affiliateTitle"
    | "mlmTitle"
    | "investorTitle"
    | "sellerTitle"
    | "accountTitle"
    | "cartTitle"
    | "modeTitle";
  bodyKey:
    | "affiliateBody"
    | "mlmBody"
    | "investorBody"
    | "sellerBody"
    | "accountBody"
    | "cartBody"
    | "modeRetail"
    | "modeOther";
};

export function HoldingPage({ titleKey, bodyKey }: Props) {
  const t = useTranslations("Holding");

  return (
    <section className="wrap py-16 md:py-24">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gold)]">
        Solangi Ecommerce
      </p>
      <h1 className="font-display mb-4 text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight">
        {t(titleKey)}
      </h1>
      <p className="mb-8 max-w-[48ch] text-[1.05rem] text-[var(--muted)]">{t(bodyKey)}</p>
      <Link
        href="/"
        className="inline-flex rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-[var(--cream)] hover:bg-[var(--teal)]"
      >
        {t("back")}
      </Link>
    </section>
  );
}
