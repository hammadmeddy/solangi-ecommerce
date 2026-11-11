"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { CustomerDashboard } from "./CustomerDashboard";

/** Signed-out gate, or customer dashboard when authenticated. */
export function AccountGateOrDashboard() {
  const t = useTranslations("Auth");
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <section className="wrap py-16">
        <p className="text-[var(--muted)]">{t("loading")}</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="wrap py-16 md:py-20">
        <div className="mx-auto max-w-xl rounded-2xl border border-[var(--line)] bg-white/80 p-8">
          <h1 className="font-display mb-3 text-3xl font-semibold">{t("accountGateTitle")}</h1>
          <p className="mb-6 text-[var(--muted)]">{t("accountGateBody")}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-[var(--cream)] hover:bg-[var(--teal)]"
            >
              {t("toLogin")}
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-full border border-[var(--line)] px-5 py-3 text-sm font-semibold hover:border-[var(--teal)]"
            >
              {t("toRegister")}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return <CustomerDashboard />;
}
