import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SolangiLogo } from "@/components/brand/SolangiLogo";

const PAYMENTS = ["Card", "JazzCash", "EasyPaisa", "Bank", "COD"] as const;

export async function Footer() {
  const t = await getTranslations("Footer");
  const j = await getTranslations("Join");

  return (
    <footer className="bg-[var(--ink)] text-[rgba(247,244,238,0.78)] pt-12 pb-6">
      <div className="wrap">
        <div className="grid gap-8 mb-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-3">
              <SolangiLogo size={48} tone="light" showTagline={false} />
            </div>
            <p className="text-sm max-w-[34ch]">{t("tagline")}</p>
            <p className="text-sm mt-3">
              {t("founder")}
              <br />
              {t("email")}
            </p>
            <div className="mt-5 flex flex-wrap gap-2" aria-label="Payment methods">
              {PAYMENTS.map((mark) => (
                <span
                  key={mark}
                  className="rounded-md border border-white/20 bg-white/5 px-2.5 py-1.5 text-[0.72rem] font-semibold tracking-wide text-[var(--cream)]"
                >
                  {mark}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[0.72rem] text-white/50">{t("payNote")}</p>
          </div>

          <div>
            <h4 className="mb-3 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[var(--gold-light)]">
              {t("shop")}
            </h4>
            <ul className="grid gap-2 text-sm">
              <li>
                <Link href="/mode/retail" className="hover:text-white">
                  Retail B2C
                </Link>
              </li>
              <li>
                <Link href="/mode/wholesale" className="hover:text-white">
                  Wholesale B2B
                </Link>
              </li>
              <li>
                <Link href="/mode/used" className="hover:text-white">
                  Used C2C
                </Link>
              </li>
              <li>
                <Link href="/mode/services" className="hover:text-white">
                  Services C2B
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[var(--gold-light)]">
              {t("participate")}
            </h4>
            <ul className="grid gap-2 text-sm">
              <li>
                <Link href="/auth/register" className="hover:text-white">
                  {j("customer")}
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-white">
                  {j("seller")}
                </Link>
              </li>
              <li>
                <Link href="/affiliate" className="hover:text-white">
                  {j("affiliate")}
                </Link>
              </li>
              <li>
                <Link href="/mlm" className="hover:text-white">
                  {j("mlm")}
                </Link>
              </li>
              <li>
                <Link href="/investor" className="hover:text-white">
                  {j("investor")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[var(--gold-light)]">
              {t("help")}
            </h4>
            <ul className="grid gap-2 text-sm">
              <li>{t("about")}</li>
              <li>{t("faqs")}</li>
              <li>{t("shipping")}</li>
              <li>{t("privacy")}</li>
              <li>{t("terms")}</li>
              <li>{t("contact")}</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-3 border-t border-white/10 pt-4 text-[0.78rem] text-white/50">
          <span>{t("copy")}</span>
          <span>{t("chromeNote")}</span>
        </div>
      </div>
    </footer>
  );
}
