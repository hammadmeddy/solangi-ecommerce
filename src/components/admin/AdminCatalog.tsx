"use client";

import { useTranslations } from "next-intl";
import { AdminShell } from "./AdminShell";
import { useAdminMedia } from "@/components/providers/AdminMediaProvider";
import { CATALOG } from "@/lib/products";
import { readFileAsDataUrl } from "@/lib/admin";
import { CategoryMedia } from "@/components/media/CategoryIcon";
import { useCurrency } from "@/components/providers/CurrencyProvider";

export function AdminCatalog() {
  const t = useTranslations("Admin");
  const { format } = useCurrency();
  const { media, setProductImage } = useAdminMedia();

  async function onPick(id: string, file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 1_500_000) {
      alert(t("fileTooLarge"));
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      await setProductImage(id, dataUrl);
    } catch (err) {
      alert(err instanceof Error ? err.message : t("saveFailed"));
    }
  }

  return (
    <AdminShell title={t("catalogTitle")} subtitle={t("catalogSub")}>
      <div className="grid gap-3">
        {CATALOG.map((product) => {
          const src = media.productImages[product.id];
          return (
            <article
              key={product.id}
              className="grid grid-cols-[72px_1fr] gap-3 rounded-xl border border-[var(--line)] bg-[var(--cream)]/40 p-3 sm:grid-cols-[88px_1fr_auto] sm:items-center"
            >
              <div className="aspect-square overflow-hidden rounded-lg border border-[var(--line)]">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt="" className="h-full w-full object-cover" />
                ) : (
                  <CategoryMedia
                    categoryId={product.categoryId}
                    size="sm"
                    className="h-full w-full"
                    ignoreAdmin
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{product.name}</p>
                <p className="text-xs text-[var(--muted)]">
                  {product.category} · {format(product.pricePkr)}
                </p>
              </div>
              <div className="col-span-2 flex flex-wrap gap-2 sm:col-span-1 sm:justify-end">
                <label className="cursor-pointer rounded-full bg-[var(--ink)] px-3 py-1.5 text-xs font-semibold text-[var(--cream)]">
                  {t("uploadPhoto")}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => void onPick(product.id, e.target.files?.[0])}
                  />
                </label>
                {src ? (
                  <button
                    type="button"
                    className="text-xs font-semibold text-[var(--sale)]"
                    onClick={() => {
                      void setProductImage(product.id, null).catch((err) => {
                        alert(err instanceof Error ? err.message : t("saveFailed"));
                      });
                    }}
                  >
                    {t("clear")}
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </AdminShell>
  );
}
