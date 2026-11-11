"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCustomer } from "@/components/providers/CustomerProvider";
import { AuthButton, AuthField } from "@/components/auth/AuthField";
import { CustomerShell } from "./CustomerShell";

export function CustomerProfile() {
  const t = useTranslations("Customer");
  const { user, updateUser } = useAuth();
  const { email, city, saveProfileExtra, ready } = useCustomer();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [mail, setMail] = useState("");
  const [town, setTown] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setPhone(user.phone);
    setMail(email);
    setTown(city);
  }, [user, email, city]);

  if (!user) return null;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    updateUser({ name: name.trim(), phone: phone.trim(), email: mail.trim() || undefined });
    saveProfileExtra({ email: mail.trim(), city: town.trim() });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <CustomerShell title={t("profileTitle")} subtitle={t("profileSub")}>
      {!ready ? (
        <p className="text-[var(--muted)]">{t("loading")}</p>
      ) : (
        <form className="grid max-w-xl gap-4" onSubmit={onSubmit}>
          <AuthField label={t("fullName")} name="name" value={name} onChange={(e) => setName(e.target.value)} required />
          <AuthField label={t("phone")} name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <AuthField
            label={t("email")}
            name="email"
            type="email"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
          />
          <AuthField label={t("city")} name="city" value={town} onChange={(e) => setTown(e.target.value)} />
          <p className="text-xs text-[var(--muted)]">
            {t("roleLabel")}: <strong>{user.role}</strong> · {t("profileNote")}
          </p>
          {saved ? <p className="text-sm font-medium text-[var(--teal)]">{t("saved")}</p> : null}
          <div className="max-w-xs">
            <AuthButton type="submit">{t("saveProfile")}</AuthButton>
          </div>
        </form>
      )}
    </CustomerShell>
  );
}
