"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminShell } from "./AdminShell";
import { useAdminMedia } from "@/components/providers/AdminMediaProvider";
import { SolangiLogo } from "@/components/brand/SolangiLogo";
import { apiGet, apiSend } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toaster";

export function AdminSettings() {
  const t = useTranslations("Admin");
  const { media, setAnnouncement, resetMedia, ready } = useAdminMedia();
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const [pct, setPct] = useState("");
  const toast = useToast();

  useEffect(() => {
    void apiGet<{ settings: { defaultCommissionPct: number } }>("/api/admin/settings")
      .then((d) => setPct(String(d.settings.defaultCommissionPct)))
      .catch(() => undefined);
  }, []);

  async function onSaveCommission(e: FormEvent) {
    e.preventDefault();
    try {
      await apiSend("PATCH", "/api/admin/settings", { defaultCommissionPct: Number(pct) });
      toast.success(t("saved"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("saveFailed"));
    }
  }

  useEffect(() => {
    if (ready) setText(media.announcement);
  }, [ready, media.announcement]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    try {
      await setAnnouncement(text.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      alert(err instanceof Error ? err.message : t("saveFailed"));
    }
  }

  return (
    <AdminShell title={t("settingsTitle")} subtitle={t("settingsSub")}>
      <div className="mb-8 rounded-xl border border-[var(--line)] bg-[var(--mist)]/40 p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          {t("logoSection")}
        </p>
        <SolangiLogo size={56} />
        <p className="mt-3 text-sm text-[var(--muted)]">{t("logoNote")}</p>
      </div>

      <form className="grid gap-3" onSubmit={onSave}>
        <label className="grid gap-1.5 text-sm font-medium">
          {t("announceLabel")}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder={t("announcePh")}
            className="rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--teal)]"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-[var(--cream)]"
          >
            {t("save")}
          </button>
          {saved ? <span className="text-sm text-[var(--teal)]">{t("saved")}</span> : null}
        </div>
      </form>

      <form className="mt-10 grid gap-2 border-t border-[var(--line)] pt-6" onSubmit={onSaveCommission}>
        <h2 className="text-sm font-semibold">{t("commissionTitle")}</h2>
        <p className="text-sm text-[var(--muted)]">{t("commissionBody")}</p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            min={0}
            max={90}
            required
            value={pct}
            onChange={(e) => setPct(e.target.value)}
            aria-label={t("commission")}
            className="w-24 rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--teal)]"
          />
          <span className="text-sm">%</span>
          <button
            type="submit"
            className="rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-[var(--cream)]"
          >
            {t("save")}
          </button>
        </div>
      </form>

      <div className="mt-10 border-t border-[var(--line)] pt-6">
        <h2 className="mb-2 text-sm font-semibold">{t("resetTitle")}</h2>
        <p className="mb-3 text-sm text-[var(--muted)]">{t("resetBody")}</p>
        <button
          type="button"
          onClick={() => {
            if (confirm(t("resetConfirm"))) {
              void resetMedia()
                .then(() => setText(""))
                .catch((err) => {
                  alert(err instanceof Error ? err.message : t("saveFailed"));
                });
            }
          }}
          className="rounded-full border border-[var(--sale)] px-4 py-2 text-sm font-semibold text-[var(--sale)]"
        >
          {t("resetCta")}
        </button>
      </div>
    </AdminShell>
  );
}
