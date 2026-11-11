"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { AUTH_ROLES, type AuthRole } from "@/lib/auth";
import { AuthShell } from "./AuthShell";
import { AuthButton, AuthField } from "./AuthField";

export function RegisterForm() {
  const t = useTranslations("Auth");
  const { startRegister, user, ready } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const initialRole = useMemo(() => {
    const q = search.get("role");
    return q === "seller" ? "seller" : "customer";
  }, [search]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<AuthRole>(initialRole);
  const [error, setError] = useState("");

  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  useEffect(() => {
    if (ready && user) router.replace("/account");
  }, [ready, user, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const cleaned = phone.replace(/\s/g, "");
    if (!name.trim()) {
      setError(t("errorName"));
      return;
    }
    if (cleaned.length < 10) {
      setError(t("errorPhone"));
      return;
    }
    setError("");
    await startRegister({ name, phone: cleaned, role });
    router.push("/auth/verify");
  }

  return (
    <AuthShell title={t("registerTitle")} subtitle={t("registerSide")}>
      <form className="grid gap-4" onSubmit={onSubmit}>
        <fieldset className="grid gap-2">
          <legend className="mb-1 text-sm font-medium text-[var(--ink)]">{t("joinAs")}</legend>
          <div className="grid grid-cols-2 gap-2">
            {AUTH_ROLES.map((item) => {
              const active = role === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id)}
                  className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                    active
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--cream)]"
                      : "border-[var(--line)] bg-[var(--cream)] text-[var(--ink)] hover:border-[var(--teal)]"
                  }`}
                >
                  <span className="block font-semibold">{t(item.labelKey)}</span>
                  <span className={`mt-0.5 block text-xs ${active ? "text-white/70" : "text-[var(--muted)]"}`}>
                    {item.id === "customer" ? t("roleCustomerHint") : t("roleSellerHint")}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-[var(--muted)]">{t("rolesNote")}</p>
        </fieldset>

        <AuthField
          label={t("fullName")}
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <AuthField
          label={t("phone")}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="03XXXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          hint={t("phoneHint")}
          required
        />
        <AuthField
          label={t("emailOptional")}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
        {error ? <p className="text-sm text-[var(--sale)]">{error}</p> : null}
        <AuthButton type="submit">{t("continueOtp")}</AuthButton>
      </form>
      <p className="mt-4 text-sm text-[var(--muted)]">
        {t("haveAccount")}{" "}
        <Link href="/auth/login" className="font-semibold text-[var(--teal)] hover:underline">
          {t("toLogin")}
        </Link>
      </p>
    </AuthShell>
  );
}
