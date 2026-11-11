"use client";

import { useEffect, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

const NAV = [
  { href: "/account" as const, key: "navDashboard" as const },
  { href: "/account/profile" as const, key: "navProfile" as const },
  { href: "/account/addresses" as const, key: "navAddresses" as const },
  { href: "/account/orders" as const, key: "navOrders" as const },
  { href: "/account/wishlist" as const, key: "navWishlist" as const },
];

export function CustomerShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const t = useTranslations("Customer");
  const ta = useTranslations("Auth");
  const { user, ready, signOut } = useAuth();
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
                item.href === "/account"
                  ? pathname === "/account"
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
          <button
            type="button"
            onClick={() => {
              signOut();
              router.push("/auth/login");
            }}
            className="mt-3 w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--sale)] hover:bg-[var(--mist)]"
          >
            {ta("signOut")}
          </button>
          {user.role === "seller" ? (
            <Link
              href="/seller"
              className="mt-1 block rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--teal)] hover:bg-[var(--mist)]"
            >
              {t("sellerDesk")}
            </Link>
          ) : null}
        </aside>

        <div className="min-w-0 rounded-2xl border border-[var(--line)] bg-white/80 p-5 md:p-7">
          {children}
        </div>
      </div>
    </section>
  );
}
