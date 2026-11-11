"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthShell } from "./AuthShell";
import { AuthButton, AuthField } from "./AuthField";

export function AdminLoginForm() {
  const t = useTranslations("Admin");
  const ta = useTranslations("Auth");
  const { startAdminLogin, user, ready } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("Solangi Admin");
  const [phone, setPhone] = useState("03000000000");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && user?.role === "admin") router.replace("/admin");
  }, [ready, user, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const cleaned = phone.replace(/\s/g, "");
    if (cleaned.length < 10) {
      setError(ta("errorPhone"));
      return;
    }
    setError("");
    await startAdminLogin({ name, phone: cleaned });
    router.push("/auth/verify");
  }

  return (
    <AuthShell title={t("loginTitle")} subtitle={t("loginSide")}>
      <form className="grid gap-4" onSubmit={onSubmit}>
        <AuthField
          label={ta("fullName")}
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <AuthField
          label={ta("phone")}
          name="phone"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          hint={t("loginHint")}
          required
        />
        {error ? <p className="text-sm text-[var(--sale)]">{error}</p> : null}
        <AuthButton type="submit">{t("loginCta")}</AuthButton>
      </form>
      <p className="mt-4 text-sm text-[var(--muted)]">
        <Link href="/auth/login" className="font-semibold text-[var(--teal)]">
          {ta("toLogin")}
        </Link>
      </p>
    </AuthShell>
  );
}
