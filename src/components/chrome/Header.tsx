"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import { SolangiLogo } from "@/components/brand/SolangiLogo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { CurrencySwitcher } from "./CurrencySwitcher";

export function Header() {
  const t = useTranslations("Header");
  const { user } = useAuth();
  const { count } = useCart();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [desktopQ, setDesktopQ] = useState("");
  const [mobileQ, setMobileQ] = useState("");
  const accountHref =
    user?.role === "admin" ? "/admin" : user ? "/account" : "/auth/login";

  function goSearch(raw: string) {
    const q = raw.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    setOpen(false);
  }

  function onDesktopSubmit(e: FormEvent) {
    e.preventDefault();
    goSearch(desktopQ);
  }

  function onMobileSubmit(e: FormEvent) {
    e.preventDefault();
    goSearch(mobileQ);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[rgba(247,244,238,0.88)] backdrop-blur-[14px]">
      <div className="wrap grid grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-5 py-2.5 min-h-[72px]">
        <Link href="/" className="min-w-0" aria-label="Solangi Ecommerce home">
          <SolangiLogo size={44} />
        </Link>

        <form
          className="hidden md:flex max-w-[560px] w-full mx-auto overflow-hidden rounded-full border border-[var(--line)] bg-white"
          role="search"
          onSubmit={onDesktopSubmit}
        >
          <label className="sr-only" htmlFor="q">
            {t("search")}
          </label>
          <input
            id="q"
            type="search"
            value={desktopQ}
            onChange={(e) => setDesktopQ(e.target.value)}
            placeholder={t("searchPh")}
            className="min-w-0 flex-1 bg-transparent px-4 py-2.5 outline-none"
          />
          <button
            type="submit"
            className="bg-[var(--ink)] px-5 text-sm font-medium text-[var(--cream)] hover:bg-[var(--teal)] transition-colors"
          >
            {t("search")}
          </button>
        </form>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <div className="hidden md:flex items-center">
            <LocaleSwitcher />
            <CurrencySwitcher />
          </div>
          <Link
            href={accountHref}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[0.8125rem] font-medium hover:bg-white/70"
            aria-label={t("account")}
          >
            <UserIcon />
            <span className="hidden lg:inline">
              {user?.role === "admin" ? t("admin") : t("account")}
            </span>
          </Link>
          <Link
            href="/cart"
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[0.8125rem] font-medium hover:bg-white/70"
            aria-label={t("cart")}
          >
            <CartIcon />
            <span className="grid h-[1.1rem] min-w-[1.1rem] place-items-center rounded-full bg-[var(--gold)] px-1 text-[0.65rem] font-bold text-white">
              {count}
            </span>
          </Link>
          <button
            type="button"
            className="md:hidden inline-flex h-10 w-10 flex-col items-center justify-center gap-1 rounded-lg border border-[var(--line)] bg-white"
            aria-label={t("menu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="block h-[1.5px] w-4 bg-[var(--ink)]" />
            <span className="block h-[1.5px] w-4 bg-[var(--ink)]" />
            <span className="block h-[1.5px] w-4 bg-[var(--ink)]" />
          </button>
        </div>
      </div>

      <form
        className="md:hidden wrap mb-2 flex overflow-hidden rounded-full border border-[var(--line)] bg-white"
        role="search"
        onSubmit={onMobileSubmit}
      >
        <label className="sr-only" htmlFor="q2">
          {t("search")}
        </label>
        <input
          id="q2"
          type="search"
          value={mobileQ}
          onChange={(e) => setMobileQ(e.target.value)}
          placeholder={t("searchPh")}
          className="min-w-0 flex-1 bg-transparent px-4 py-2.5 outline-none"
        />
        <button
          type="submit"
          className="bg-[var(--ink)] px-4 text-sm font-medium text-[var(--cream)]"
        >
          {t("search")}
        </button>
      </form>

      <div className="md:hidden wrap flex gap-2 pb-3">
        <LocaleSwitcher variant="mobile" />
        <CurrencySwitcher variant="mobile" />
      </div>

      {open ? (
        <div className="md:hidden border-t border-[var(--line)] bg-white/95 px-4 py-3 text-sm text-[var(--muted)]">
          <Link href={accountHref} className="block py-1 hover:text-[var(--ink)]">
            {user?.role === "admin" ? t("admin") : t("account")}
          </Link>
          <Link href="/search" className="block py-1 hover:text-[var(--ink)]">
            {t("search")}
          </Link>
          <Link href="/auth/register" className="block py-1 hover:text-[var(--ink)]">
            Start selling
          </Link>
          <Link href="/auth/login" className="block py-1 hover:text-[var(--ink)]">
            Login
          </Link>
          <Link href="/auth/admin" className="block py-1 hover:text-[var(--ink)]">
            {t("admin")}
          </Link>
        </div>
      ) : null}
    </header>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19.5c1.8-3.2 4.2-4.8 7-4.8s5.2 1.6 7 4.8" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6h2l1.4 9.2a1.5 1.5 0 0 0 1.5 1.3h8.3a1.5 1.5 0 0 0 1.5-1.2L20 8H7" />
      <circle cx="10" cy="20" r="1.2" />
      <circle cx="17" cy="20" r="1.2" />
    </svg>
  );
}
