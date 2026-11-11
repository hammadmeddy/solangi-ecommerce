"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthButton } from "@/components/auth/AuthField";
import { apiPost } from "@/lib/api-client";
import type { AuthUser } from "@/lib/auth";

const NAV = [
  { href: "/seller" as const, key: "navDashboard" as const },
  { href: "/seller/store" as const, key: "navStore" as const },
  { href: "/seller/listings" as const, key: "navListings" as const },
  { href: "/seller/orders" as const, key: "navOrders" as const },
];

export function SellerShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const t = useTranslations("Seller");
  const ta = useTranslations("Auth");
  const { user, ready, updateUser, signOut } = useAuth();
  const [enabling, setEnabling] = useState(false);
  const [enableError, setEnableError] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !user) router.replace("/auth/login");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <section className="wrap py-16">
        <p className="text-[var(--muted)]">{ta("loading")}</p>
      </section>
    );
  }

  if (user.role !== "seller") {
    return (
      <section className="wrap py-16 md:py-20">
        <div className="mx-auto max-w-xl rounded-2xl border border-[var(--line)] bg-white/80 p-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gold)]">
            {t("eyebrow")}
          </p>
          <h1 className="font-display mb-3 text-3xl font-semibold">{t("enableTitle")}</h1>
          <p className="mb-6 text-[var(--muted)]">{t("enableBody")}</p>
          <div className="grid max-w-sm gap-3">
            <AuthButton
              type="button"
              disabled={enabling}
              onClick={() => {
                setEnableError("");
                setEnabling(true);
                void apiPost<{ user: AuthUser }>("/api/seller/enable", {})
                  .then((res) => updateUser(res.user))
                  .catch((err) => {
                    setEnableError(err instanceof Error ? err.message : t("saveFailed"));
                  })
                  .finally(() => setEnabling(false));
              }}
            >
              {t("enableCta")}
            </AuthButton>
            {enableError ? (
              <p className="text-sm font-medium text-[var(--sale)]">{enableError}</p>
            ) : null}
            <Link
              href="/account"
              className="inline-flex items-center justify-center rounded-full border border-[var(--line)] px-5 py-3 text-sm font-semibold hover:border-[var(--teal)]"
            >
              {t("backCustomer")}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="wrap py-8 md:py-12">
      <div className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gold)]">
          {t("eyebrow")}
        </p>
        <h1 className="font-display text-[clamp(1.9rem,3.5vw,2.6rem)] font-semibold leading-tight">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-[52ch] text-[var(--muted)]">{subtitle}</p>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-2xl border border-[var(--line)] bg-white/75 p-3">
          <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            {user.name}
          </p>
          <nav className="grid gap-1" aria-label={t("navLabel")}>
            {NAV.map((item) => {
              const active =
                item.href === "/seller"
                  ? pathname === "/seller"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-[var(--ink)] text-[var(--cream)]"
                      : "text-[var(--ink-soft)] hover:bg-[var(--mist)]"
                  }`}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>
          <Link
            href="/account"
            className="mt-3 block rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--teal)] hover:bg-[var(--mist)]"
          >
            {t("customerPortal")}
          </Link>
          <button
            type="button"
            onClick={() => {
              signOut();
              router.push("/auth/login");
            }}
            className="mt-1 w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--sale)] hover:bg-[var(--mist)]"
          >
            {ta("signOut")}
          </button>
        </aside>

        <div className="min-w-0 rounded-2xl border border-[var(--line)] bg-white/80 p-5 md:p-7">
          {children}
        </div>
      </div>
    </section>
  );
}
