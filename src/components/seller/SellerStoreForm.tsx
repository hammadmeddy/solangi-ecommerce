"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSeller } from "@/components/providers/SellerProvider";
import { AuthButton, AuthField } from "@/components/auth/AuthField";
import { SellerShell } from "./SellerShell";

export function SellerStoreForm() {
  const t = useTranslations("Seller");
  const { user } = useAuth();
  const { store, saveStore, ready } = useSeller();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(store.name);
    setSlug(store.slug);
    setCity(store.city);
    setPhone(store.phone);
    setBio(store.bio);
  }, [store]);

  if (!user || user.role !== "seller") {
    return (
      <SellerShell title={t("storeTitle")} subtitle={t("storeSub")}>
        <p className="text-[var(--muted)]">{t("loading")}</p>
      </SellerShell>
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    saveStore({
      name: name.trim(),
      slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
      city: city.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      verified: store.verified,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <SellerShell title={t("storeTitle")} subtitle={t("storeSub")}>
      {!ready ? (
        <p className="text-[var(--muted)]">{t("loading")}</p>
      ) : (
        <form className="grid max-w-xl gap-4" onSubmit={onSubmit}>
          <AuthField label={t("storeName")} value={name} onChange={(e) => setName(e.target.value)} required />
          <AuthField label={t("storeSlug")} value={slug} onChange={(e) => setSlug(e.target.value)} hint={t("slugHint")} required />
          <AuthField label={t("city")} value={city} onChange={(e) => setCity(e.target.value)} />
          <AuthField label={t("phone")} value={phone} onChange={(e) => setPhone(e.target.value)} />
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">{t("bio")}</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="rounded-xl border border-[var(--line)] bg-[var(--cream)] px-3.5 py-3 outline-none transition focus:border-[var(--teal)] focus:bg-white"
            />
          </label>
          <p className="text-xs text-[var(--muted)]">
            {store.verified ? t("verified") : t("unverified")} · {t("storeNote")}
          </p>
          {saved ? <p className="text-sm font-medium text-[var(--teal)]">{t("saved")}</p> : null}
          <div className="max-w-xs">
            <AuthButton type="submit">{t("saveStore")}</AuthButton>
          </div>
        </form>
      )}
    </SellerShell>
  );
}
