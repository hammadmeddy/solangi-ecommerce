"use client";

import { useEffect, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { SolangiLogo } from "@/components/brand/SolangiLogo";

const NAV = [
  { href: "/admin" as const, key: "navDashboard" as const },
  { href: "/admin/media" as const, key: "navMedia" as const },
  { href: "/admin/catalog" as const, key: "navCatalog" as const },
  { href: "/admin/orders" as const, key: "navOrders" as const },
  { href: "/admin/reviews" as const, key: "navReviews" as const },
  { href: "/admin/settings" as const, key: "navSettings" as const },
];

export function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const t = useTranslations("Admin");
  const ta = useTranslations("Auth");
  const { user, ready, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/auth/admin");
    else if (user.role !== "admin") router.replace("/account");
  }, [ready, user, router]);

  if (!ready || !user || user.role !== "admin") {
    return (
      <section className="wrap py-16">
        <p className="text-[var(--muted)]">{t("loading")}</p>
      </section>
    );
  }

  return (
    <section className="wrap py-8 md:py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gold)]">
            {t("eyebrow")}
          </p>
          <h1 className="font-display text-[clamp(1.9rem,3.5vw,2.6rem)] font-semibold leading-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 max-w-[56ch] text-[var(--muted)]">{subtitle}</p>
          ) : null}
        </div>
        <SolangiLogo size={40} showTagline={false} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
        <aside className="h-fit rounded-2xl border border-[var(--line)] bg-white/75 p-3">
          <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            {user.name}
          </p>
          <nav className="grid gap-1" aria-label={t("navLabel")}>
            {NAV.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
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
            href="/"
            className="mt-3 block rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--teal)] hover:bg-[var(--mist)]"
          >
            {t("viewShop")}
          </Link>
          <button
            type="button"
            onClick={() => {
              signOut();
              router.push("/auth/admin");
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
