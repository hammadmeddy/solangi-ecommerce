"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/Toaster";
import { AuthShell } from "./AuthShell";
import { AuthButton, AuthField } from "./AuthField";

export function ForgotForm() {
  const t = useTranslations("Auth");
  const { startLogin } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const toast = useToast();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function fail(message: string) {
    setError(message);
    toast.error(message);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const cleaned = phone.replace(/\s/g, "");
    if (cleaned.length < 10) {
      fail(t("errorPhone"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      fail(t("errorEmail"));
      return;
    }
    setError("");
    setBusy(true);
    try {
      await startLogin({ phone: cleaned, email: email.trim() });
      toast.success(t("otpSent"), t("otpSentDetail"));
      router.push("/auth/verify");
    } catch {
      fail(t("errorOtpSend"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title={t("forgotTitle")} subtitle={t("forgotSide")}>
      <form className="grid gap-4" onSubmit={onSubmit}>
        <AuthField
          label={t("phone")}
          name="phone"
          type="tel"
          inputMode="tel"
          placeholder="03XXXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          hint={t("forgotHint")}
          required
        />
        <AuthField
          label={t("email")}
          name="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          hint={t("emailOtpHint")}
          required
        />
        {error ? <p className="text-sm text-[var(--sale)]">{error}</p> : null}
        <AuthButton type="submit" busy={busy}>
          {busy ? t("loading") : t("sendResetOtp")}
        </AuthButton>
      </form>
      <p className="mt-4 text-sm">
        <Link href="/auth/login" className="font-semibold text-[var(--teal)] hover:underline">
          {t("toLogin")}
        </Link>
      </p>
    </AuthShell>
  );
}
