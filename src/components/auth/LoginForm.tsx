"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthShell } from "./AuthShell";
import { AuthButton, AuthField } from "./AuthField";

export function LoginForm() {
  const t = useTranslations("Auth");
  const { startLogin, user, ready } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/account");
  }, [ready, user, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const cleaned = phone.replace(/\s/g, "");
    if (cleaned.length < 10) {
      setError(t("errorPhone"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(t("errorEmail"));
      return;
    }
    setError("");
    setBusy(true);
    try {
      await startLogin({ phone: cleaned, email: email.trim() });
      router.push("/auth/verify");
    } catch {
      setError(t("errorOtpSend"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title={t("loginTitle")} subtitle={t("loginSide")}>
      <form className="grid gap-4" onSubmit={onSubmit}>
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
          label={t("email")}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          hint={t("emailOtpHint")}
          required
        />
        {error ? <p className="text-sm text-[var(--sale)]">{error}</p> : null}
        <AuthButton type="submit" disabled={busy}>
          {busy ? t("loading") : t("continueOtp")}
        </AuthButton>
      </form>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
        <Link href="/auth/forgot" className="font-medium text-[var(--teal)] hover:underline">
          {t("forgot")}
        </Link>
        <Link href="/auth/register" className="font-medium text-[var(--ink)] hover:underline">
          {t("toRegister")}
        </Link>
      </div>
      <p className="mt-4 text-xs text-[var(--muted)]">
        <Link href="/auth/admin" className="font-semibold text-[var(--gold)] hover:underline">
          Admin panel access
        </Link>
      </p>
    </AuthShell>
  );
}
