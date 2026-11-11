"use client";

import { useTranslations } from "next-intl";
import { AdminShell } from "./AdminShell";
import { useAdminMedia } from "@/components/providers/AdminMediaProvider";
import { CATEGORIES } from "@/lib/categories";
import { readFileAsDataUrl } from "@/lib/admin";
import { CategoryMedia } from "@/components/media/CategoryIcon";

const HERO_LABELS = ["Retail hero", "Flash hero", "Modes hero"];

export function AdminMedia() {
  const t = useTranslations("Admin");
  const { media, setCategoryImage, setHeroImage } = useAdminMedia();

  async function onPick(
    file: File | undefined,
    apply: (dataUrl: string) => Promise<void>,
  ) {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 1_500_000) {
      alert(t("fileTooLarge"));
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      await apply(dataUrl);
    } catch (err) {
      alert(err instanceof Error ? err.message : t("saveFailed"));
    }
  }

  return (
    <AdminShell title={t("mediaTitle")} subtitle={t("mediaSub")}>
      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          {t("heroSection")}
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {HERO_LABELS.map((label, i) => {
            const src = media.heroImages[String(i)];
            return (
              <div
                key={label}
                className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--cream)]/50"
              >
                <div className="relative aspect-[16/10] bg-[var(--mist)]">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={label} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center px-3 text-center text-xs text-[var(--muted)]">
                      {t("usingDefault")}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 p-3">
                  <p className="me-auto text-sm font-medium">{label}</p>
                  <label className="cursor-pointer rounded-full bg-[var(--ink)] px-3 py-1.5 text-xs font-semibold text-[var(--cream)]">
                    {t("upload")}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) =>
                        void onPick(e.target.files?.[0], (url) => setHeroImage(i, url))
                      }
                    />
                  </label>
                  {src ? (
                    <button
                      type="button"
                      className="text-xs font-semibold text-[var(--sale)]"
                      onClick={() => {
                        void setHeroImage(i, null).catch((err) => {
                          alert(err instanceof Error ? err.message : t("saveFailed"));
                        });
                      }}
                    >
                      {t("clear")}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          {t("categorySection")}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const src = media.categoryImages[cat.id];
            return (
              <div
                key={cat.id}
                className="overflow-hidden rounded-xl border border-[var(--line)] bg-white"
              >
                <div className="aspect-square">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={cat.name} className="h-full w-full object-cover" />
                  ) : (
                    <CategoryMedia
                      categoryId={cat.id}
                      label={cat.name}
                      size="sm"
                      className="h-full w-full"
                      ignoreAdmin
                    />
                  )}
                </div>
                <div className="p-2.5">
                  <p className="mb-2 truncate text-xs font-semibold">{cat.name}</p>
                  <div className="flex flex-wrap gap-2">
                    <label className="cursor-pointer rounded-full bg-[var(--teal)] px-2.5 py-1 text-[0.68rem] font-semibold text-white">
                      {t("upload")}
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) =>
                          void onPick(e.target.files?.[0], (url) =>
                            setCategoryImage(cat.id, url),
                          )
                        }
                      />
                    </label>
                    {src ? (
                      <button
                        type="button"
                        className="text-[0.68rem] font-semibold text-[var(--sale)]"
                        onClick={() => {
                          void setCategoryImage(cat.id, null).catch((err) => {
                            alert(err instanceof Error ? err.message : t("saveFailed"));
                          });
                        }}
                      >
                        {t("clear")}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </AdminShell>
  );
}
