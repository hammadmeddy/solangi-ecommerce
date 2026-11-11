"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthShell } from "./AuthShell";
import { AuthButton, AuthField } from "./AuthField";

export function ForgotForm() {
  const t = useTranslations("Auth");
  const { startLogin } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const cleaned = phone.replace(/\s/g, "");
    if (cleaned.length < 10) {
      setError(t("errorPhone"));
      return;
    }
    setError("");
    startLogin(cleaned);
    router.push("/auth/verify");
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
        {error ? <p className="text-sm text-[var(--sale)]">{error}</p> : null}
        <AuthButton type="submit">{t("sendResetOtp")}</AuthButton>
      </form>
      <p className="mt-4 text-sm">
        <Link href="/auth/login" className="font-semibold text-[var(--teal)] hover:underline">
          {t("toLogin")}
        </Link>
      </p>
    </AuthShell>
  );
}
