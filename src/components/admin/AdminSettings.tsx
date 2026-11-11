"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminShell } from "./AdminShell";
import { useAdminMedia } from "@/components/providers/AdminMediaProvider";
import { SolangiLogo } from "@/components/brand/SolangiLogo";

export function AdminSettings() {
  const t = useTranslations("Admin");
  const { media, setAnnouncement, resetMedia, ready } = useAdminMedia();
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (ready) setText(media.announcement);
  }, [ready, media.announcement]);

  function onSave(e: FormEvent) {
    e.preventDefault();
    setAnnouncement(text.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
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

      <div className="mt-10 border-t border-[var(--line)] pt-6">
        <h2 className="mb-2 text-sm font-semibold">{t("resetTitle")}</h2>
        <p className="mb-3 text-sm text-[var(--muted)]">{t("resetBody")}</p>
        <button
          type="button"
          onClick={() => {
            if (confirm(t("resetConfirm"))) {
              resetMedia();
              setText("");
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
