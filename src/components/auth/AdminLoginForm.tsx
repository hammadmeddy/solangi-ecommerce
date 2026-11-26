"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/Toaster";
import { AuthShell } from "./AuthShell";
import { AuthButton, AuthField } from "./AuthField";

export function AdminLoginForm() {
  const t = useTranslations("Admin");
  const ta = useTranslations("Auth");
  const { startAdminLogin, user, ready } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("Solangi Admin");
  const [phone, setPhone] = useState("03000000000");
  const [email, setEmail] = useState("yasirhammad21@gmail.com");
  const toast = useToast();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function fail(message: string) {
    setError(message);
    toast.error(message);
  }

  useEffect(() => {
    if (ready && user?.role === "admin") router.replace("/admin");
  }, [ready, user, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const cleaned = phone.replace(/\s/g, "");
    if (cleaned.length < 10) {
      fail(ta("errorPhone"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      fail(ta("errorEmail"));
      return;
    }
    setError("");
    setBusy(true);
    try {
      await startAdminLogin({
        name,
        phone: cleaned,
        email: email.trim(),
      });
      toast.success(ta("otpSent"), ta("otpSentDetail"));
      router.push("/auth/verify");
    } catch (err) {
      // Show the server's reason (e.g. suspended, not an admin) when it sent one.
      const message = err instanceof Error ? err.message : "";
      fail(message && !message.includes(" failed (") ? message : ta("errorOtpSend"));
    } finally {
      setBusy(false);
    }
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
        <AuthField
          label={ta("email")}
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          hint={ta("emailOtpHint")}
          required
        />
        {error ? <p className="text-sm text-[var(--sale)]">{error}</p> : null}
        <AuthButton type="submit" busy={busy}>
          {busy ? ta("loading") : t("loginCta")}
        </AuthButton>
      </form>
      <p className="mt-4 text-sm text-[var(--muted)]">
        <Link href="/auth/login" className="font-semibold text-[var(--teal)]">
          {ta("toLogin")}
        </Link>
      </p>
    </AuthShell>
  );
}
