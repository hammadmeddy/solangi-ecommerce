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
    const result = await completeVerify(otp);
    if (!result.ok) {
      setError(t("errorOtp"));
      return;
    }
    setError("");
    router.push(homeForRole(role));
  }

  return (
    <AuthShell title={t("verifyTitle")} subtitle={t("verifySide")}>
      <p className="mb-4 text-sm text-[var(--muted)]">
        {t("verifySent", { phone: pending.phone })}
      </p>
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
        <AuthButton type="submit">{t("verifyCta")}</AuthButton>
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
