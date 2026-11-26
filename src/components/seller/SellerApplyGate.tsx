"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSeller } from "@/components/providers/SellerProvider";
import { AuthButton, AuthField } from "@/components/auth/AuthField";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { StatusPill } from "@/components/admin/AdminBits";

/**
 * What a non-seller sees on /seller: the application form, or the status of
 * the application they already sent (pending, rejected, suspended).
 */
export function SellerApplyGate() {
  const t = useTranslations("Seller");
  const { user, updateUser } = useAuth();
  const { ready, application, apply } = useSeller();
  const [form, setForm] = useState({ name: "", city: "", phone: "", cnic: "", bio: "" });
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (application) {
      setForm({
        name: application.name,
        city: application.city,
        phone: application.phone,
        cnic: application.cnic,
        bio: application.bio,
      });
    } else if (user) {
      setForm((f) => ({ ...f, name: f.name || `${user.name}'s Store`, phone: f.phone || user.phone }));
    }
  }, [application, user]);

  // Approved while this tab was open: unlock the panel.
  useEffect(() => {
    if (application?.status === "approved" && user?.role !== "seller") {
      updateUser({ role: "seller" });
    }
  }, [application, user, updateUser]);

  if (!ready) return <PremiumLoader variant="panel" label={t("loading")} />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await apply(form);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("saveFailed"));
    } finally {
      setBusy(false);
    }
  }

  const status = application?.status;
  const showForm = !application || editing;

  return (
    <section className="wrap py-16 md:py-20">
      <div className="mx-auto max-w-xl rounded-2xl border border-[var(--line)] bg-white/80 p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gold)]">
          {t("eyebrow")}
        </p>

        {status && !editing ? (
          <>
            <h1 className="font-display mb-3 flex flex-wrap items-center gap-3 text-3xl font-semibold">
              {t(`apply_${status}_title`)}
              <StatusPill status={status} label={t(`appStatus.${status}`)} />
            </h1>
            <p className="mb-4 text-[var(--muted)]">{t(`apply_${status}_body`)}</p>
            {application?.rejectionReason ? (
              <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-[var(--sale)]">
                {t("adminNote")}: {application.rejectionReason}
              </p>
            ) : null}
            <dl className="mb-6 grid gap-1 text-sm">
              <div><dt className="inline font-semibold">{t("storeName")}:</dt> <dd className="inline">{application?.name}</dd></div>
              <div><dt className="inline font-semibold">{t("city")}:</dt> <dd className="inline">{application?.city}</dd></div>
              <div><dt className="inline font-semibold">{t("appliedOn")}:</dt> <dd className="inline">{application?.appliedAt.slice(0, 10)}</dd></div>
            </dl>
            <div className="grid max-w-sm gap-3">
              {status === "rejected" || status === "pending" ? (
                <AuthButton type="button" variant={status === "rejected" ? "primary" : "ghost"} onClick={() => setEditing(true)}>
                  {status === "rejected" ? t("reapply") : t("editApplication")}
                </AuthButton>
              ) : null}
              <Link
                href="/account"
                className="inline-flex items-center justify-center rounded-full border border-[var(--line)] px-5 py-3 text-sm font-semibold hover:border-[var(--teal)]"
              >
                {t("backCustomer")}
              </Link>
            </div>
          </>
        ) : null}

        {showForm ? (
          <>
            <h1 className="font-display mb-3 text-3xl font-semibold">{t("applyTitle")}</h1>
            <p className="mb-6 text-[var(--muted)]">{t("applyBody")}</p>
            <form className="grid gap-3" onSubmit={onSubmit}>
              <AuthField
                label={t("storeName")}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                minLength={2}
                maxLength={80}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <AuthField
                  label={t("city")}
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                  minLength={2}
                />
                <AuthField
                  label={t("phone")}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  inputMode="tel"
                />
              </div>
              <AuthField
                label={t("cnic")}
                hint={t("cnicHint")}
                value={form.cnic}
                onChange={(e) => setForm({ ...form, cnic: e.target.value })}
                required
                pattern="\d{5}-?\d{7}-?\d"
                placeholder="42101-1234567-1"
              />
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">{t("applyBio")}</span>
                <textarea
                  rows={3}
                  required
                  minLength={10}
                  maxLength={600}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="rounded-xl border border-[var(--line)] bg-[var(--cream)] px-3.5 py-3 outline-none focus:border-[var(--teal)] focus:bg-white"
                />
              </label>
              {error ? <p className="text-sm font-medium text-[var(--sale)]">{error}</p> : null}
              <div className="flex max-w-sm gap-2">
                <AuthButton type="submit" disabled={busy}>
                  {t("applySubmit")}
                </AuthButton>
                {editing ? (
                  <AuthButton type="button" variant="ghost" onClick={() => setEditing(false)}>
                    {t("cancel")}
                  </AuthButton>
                ) : (
                  <Link
                    href="/account"
                    className="inline-flex items-center justify-center rounded-full border border-[var(--line)] px-5 py-3 text-sm font-semibold hover:border-[var(--teal)]"
                  >
                    {t("backCustomer")}
                  </Link>
                )}
              </div>
            </form>
          </>
        ) : null}
      </div>
    </section>
  );
}
