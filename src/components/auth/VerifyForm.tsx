"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { homeForRole } from "@/lib/auth";
import { AuthShell } from "./AuthShell";
import { AuthButton, AuthField } from "./AuthField";

export function VerifyForm() {
  const t = useTranslations("Auth");
  const { pending, completeVerify, clearPending } = useAuth();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!pending) {
      router.replace("/auth/login");
    }
  }, [pending, router]);

  if (!pending) {
    return (
      <AuthShell title={t("verifyTitle")} subtitle={t("verifySide")}>
        <p className="text-sm text-[var(--muted)]">{t("verifyMissing")}</p>
        <Link href="/auth/login" className="mt-4 inline-flex font-semibold text-[var(--teal)]">
          {t("toLogin")}
        </Link>
      </AuthShell>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!pending) return;
    const role = pending.role;
    setBusy(true);
    const result = await completeVerify(otp);
    setBusy(false);
    if (!result.ok) {
      setError(t("errorOtp"));
      return;
    }
    setError("");
    router.push(homeForRole(role));
  }

  const destination = pending.emailMasked || pending.email || pending.phone;

  return (
    <AuthShell title={t("verifyTitle")} subtitle={t("verifySide")}>
      <p className="mb-4 text-sm text-[var(--muted)]">
        {t("verifySentEmail", { email: destination })}
      </p>
      {pending.demoHint ? (
        <p className="mb-4 rounded-lg border border-[var(--line)] bg-[var(--mist)]/50 px-3 py-2 text-xs text-[var(--muted)]">
          {t("otpDemoHint", { code: pending.demoHint })}
        </p>
      ) : null}
      <form className="grid gap-4" onSubmit={onSubmit}>
        <AuthField
          label={t("otp")}
          name="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          hint={t("otpHint")}
          required
        />
        {error ? <p className="text-sm text-[var(--sale)]">{error}</p> : null}
        <AuthButton type="submit" disabled={busy}>
          {busy ? t("loading") : t("verifyCta")}
        </AuthButton>
        <AuthButton
          type="button"
          variant="ghost"
          onClick={() => {
            clearPending();
            router.push(pending.mode === "register" ? "/auth/register" : "/auth/login");
          }}
        >
          {t("changePhone")}
        </AuthButton>
      </form>
    </AuthShell>
  );
}
