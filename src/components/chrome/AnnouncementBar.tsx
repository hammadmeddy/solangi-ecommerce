"use client";

import { useTranslations } from "next-intl";
import { useAdminMedia } from "@/components/providers/AdminMediaProvider";

export function AnnouncementBar() {
  const t = useTranslations("Announce");
  const { media } = useAdminMedia();
  const custom = media.announcement?.trim();

  return (
    <div className="bg-[var(--ink)] text-[rgba(247,244,238,0.9)] text-[0.78rem]">
      <div className="wrap flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-2 text-center">
        {custom ? (
          <p>{custom}</p>
        ) : (
          <>
            <p>
              <strong className="font-semibold text-[var(--gold-light)]">{t("deliveryStrong")}</strong>{" "}
              {t("delivery")}
            </p>
            <span className="hidden sm:inline opacity-40">·</span>
            <p className="hidden sm:inline">{t("sell")}</p>
            <span className="hidden md:inline opacity-40">·</span>
            <p className="hidden md:inline">{t("payments")}</p>
          </>
        )}
      </div>
    </div>
  );
}
