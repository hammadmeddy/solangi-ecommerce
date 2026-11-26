"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCustomer } from "@/components/providers/CustomerProvider";
import { AuthButton, AuthField } from "@/components/auth/AuthField";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { useToast } from "@/components/ui/Toaster";
import { CustomerShell } from "./CustomerShell";

export function CustomerProfile() {
  const t = useTranslations("Customer");
  const ta = useTranslations("Admin");
  const { user } = useAuth();
  const { email, city, saveProfile, ready } = useCustomer();
  const toast = useToast();
  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [town, setTown] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setMail(email);
    setTown(city);
  }, [user, email, city]);

  if (!user) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await saveProfile({ name: name.trim(), email: mail.trim(), city: town.trim() });
      toast.success(t("saved"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("saveFailed"));
    } finally {
      setBusy(false);
    }
  }

  const roleKey = user.role === "seller" ? "roleSeller" : user.role === "admin" ? "roleAdmin" : "roleCustomer";

  return (
    <CustomerShell title={t("profileTitle")} subtitle={t("profileSub")}>
      {!ready ? (
        <PremiumLoader variant="panel" label={t("loading")} />
      ) : (
        <form className="grid max-w-xl gap-4" onSubmit={onSubmit}>
          <AuthField label={t("fullName")} name="name" value={name} onChange={(e) => setName(e.target.value)} required />
          <AuthField
            label={t("phone")}
            name="phone"
            value={user.phone}
            readOnly
            disabled
            hint={t("phoneLocked")}
          />
          <AuthField
            label={t("email")}
            name="email"
            type="email"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            hint={t("emailHint")}
          />
          <AuthField label={t("city")} name="city" value={town} onChange={(e) => setTown(e.target.value)} />
          <p className="text-xs text-[var(--muted)]">
            {t("roleLabel")}: <strong>{ta(roleKey)}</strong>
          </p>
          <div className="max-w-xs">
            <AuthButton type="submit" busy={busy}>
              {t("saveProfile")}
            </AuthButton>
          </div>
        </form>
      )}
    </CustomerShell>
  );
}
