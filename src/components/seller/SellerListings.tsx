"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSeller, type ListingInput } from "@/components/providers/SellerProvider";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { CATEGORIES } from "@/lib/categories";
import type { SellerListing } from "@/lib/seller";
import { AuthButton, AuthField } from "@/components/auth/AuthField";
import { UiDropdown } from "@/components/ui/UiDropdown";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { useToast } from "@/components/ui/Toaster";
import { StatusPill } from "@/components/admin/AdminBits";
import { SellerShell } from "./SellerShell";

const shopCategories = CATEGORIES.filter((c) => c.href !== "services-mode");
const MAX_IMAGE_BYTES = 1_500_000;

type Draft = Omit<ListingInput, "draft"> & { imageUrl?: string | null; status?: SellerListing["status"] };

function toDraft(item: SellerListing): Draft {
  return {
    id: item.id,
    name: item.name,
    categoryId: item.categoryId,
    pricePkr: item.pricePkr,
    stock: item.stock,
    description: item.description,
    imageUrl: item.imageUrl,
    status: item.status,
  };
}

export function SellerListings() {
  const t = useTranslations("Seller");
  const { user } = useAuth();
  const { listings, saveListing, removeListing, ready } = useSeller();
  const { format } = useCurrency();
  const toast = useToast();
  const [editing, setEditing] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user || user.role !== "seller") {
    return (
      <SellerShell title={t("listingsTitle")} subtitle={t("listingsSub")}>
        <PremiumLoader variant="panel" label={t("loading")} />
      </SellerShell>
    );
  }

  function startNew() {
    setError("");
    setEditing({
      name: "",
      categoryId: shopCategories[0].id,
      pricePkr: 1000,
      stock: 1,
      description: "",
    });
  }

  function onPickImage(file: File | undefined) {
    if (!file || !editing) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setError(t("imageTooBig"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setEditing((cur) => (cur ? { ...cur, imageDataUrl: String(reader.result) } : cur));
    };
    reader.readAsDataURL(file);
  }

  async function save(draft: boolean) {
    if (!editing || !editing.name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const saved = await saveListing({
        id: editing.id,
        name: editing.name.trim(),
        categoryId: editing.categoryId,
        pricePkr: editing.pricePkr,
        stock: editing.stock,
        description: editing.description.trim(),
        imageDataUrl: editing.imageDataUrl,
        draft,
      });
      setEditing(null);
      toast.success(
        saved.status === "pending" ? t("sentForReview") : saved.status === "draft" ? t("savedDraft") : t("savedLive"),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t("saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void save(false);
  }

  const preview = editing?.imageDataUrl || editing?.imageUrl || null;
  const pendingCount = listings.filter((l) => l.status === "pending").length;

  return (
    <SellerShell title={t("listingsTitle")} subtitle={t("listingsSub")}>
      {!ready ? (
        <PremiumLoader variant="panel" label={t("loading")} />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[var(--muted)]">
                {t("listingsCount", { count: listings.length })}
                {pendingCount ? ` · ${t("pendingCount", { n: pendingCount })}` : ""}
              </p>
              <p className="text-xs text-[var(--teal)]">{t("reviewHint")}</p>
            </div>
            <button
              type="button"
              onClick={startNew}
              className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-[var(--cream)] hover:bg-[var(--teal)]"
            >
              {t("addListing")}
            </button>
          </div>

          {error && !editing ? (
            <p className="mb-4 text-sm font-medium text-[var(--sale)]">{error}</p>
          ) : null}

          {editing ? (
            <form className="mb-6 grid max-w-xl gap-3 rounded-xl border border-[var(--line)] bg-white p-4" onSubmit={onSubmit}>
              <h3 className="font-display text-lg font-semibold">
                {editing.id ? t("editListing") : t("addListing")}
              </h3>
              {editing.status === "rejected" ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--sale)]">{t("rejectedFixHint")}</p>
              ) : null}
              <AuthField
                label={t("productName")}
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                required
              />
              <UiDropdown
                variant="field"
                ariaLabel={t("category")}
                label={t("category")}
                value={editing.categoryId}
                options={shopCategories.map((c) => ({ value: c.id, label: c.name }))}
                onChange={(next) => setEditing({ ...editing, categoryId: next })}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <AuthField
                  label={t("pricePkr")}
                  type="number"
                  min={1}
                  value={editing.pricePkr}
                  onChange={(e) => setEditing({ ...editing, pricePkr: Number(e.target.value) || 0 })}
                  required
                />
                <AuthField
                  label={t("stock")}
                  type="number"
                  min={0}
                  value={editing.stock}
                  onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) || 0 })}
                />
              </div>
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">{t("description")}</span>
                <textarea
                  rows={3}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="rounded-xl border border-[var(--line)] bg-[var(--cream)] px-3.5 py-3 outline-none focus:border-[var(--teal)] focus:bg-white"
                />
              </label>
              <div className="grid gap-1.5 text-sm">
                <span className="font-medium">{t("photo")}</span>
                <div className="flex items-center gap-3">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  ) : null}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => onPickImage(e.target.files?.[0])}
                    className="text-xs"
                  />
                </div>
              </div>
              <p className="text-xs text-[var(--muted)]">{t("reviewRule")}</p>
              {error ? <p className="text-sm font-medium text-[var(--sale)]">{error}</p> : null}
              <div className="flex flex-wrap gap-2">
                <AuthButton type="submit" disabled={saving} className="!w-auto">
                  {t("submitListing")}
                </AuthButton>
                <AuthButton type="button" variant="ghost" disabled={saving} onClick={() => void save(true)} className="!w-auto">
                  {t("saveDraft")}
                </AuthButton>
                <AuthButton type="button" variant="ghost" onClick={() => setEditing(null)} className="!w-auto">
                  {t("cancel")}
                </AuthButton>
              </div>
            </form>
          ) : null}

          <ul className="grid gap-3">
            {listings.map((item) => (
              <li key={item.id} className="rounded-xl border border-[var(--line)] bg-[var(--cream)]/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
                    ) : null}
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-semibold">
                        {item.name}
                        <StatusPill status={item.status} label={t(`listingStatus.${item.status}`)} />
                      </p>
                      <p className="text-sm text-[var(--muted)]">
                        {item.category} · {t("stock")}: {item.stock}
                      </p>
                      <p className="mt-1 font-bold">{format(item.pricePkr)}</p>
                      {item.reviewNote && item.status !== "active" ? (
                        <p className="mt-1 text-xs text-[var(--sale)]">
                          {t("adminNote")}: {item.reviewNote}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-sm font-semibold text-[var(--teal)]"
                      onClick={() => {
                        setError("");
                        setEditing(toDraft(item));
                      }}
                    >
                      {t("edit")}
                    </button>
                    <button
                      type="button"
                      className="text-sm font-semibold text-[var(--sale)]"
                      onClick={() => {
                        if (!confirm(t("removeConfirm", { name: item.name }))) return;
                        setError("");
                        void removeListing(item.id).catch((err) => {
                          setError(err instanceof Error ? err.message : t("saveFailed"));
                        });
                      }}
                    >
                      {t("remove")}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </SellerShell>
  );
}
