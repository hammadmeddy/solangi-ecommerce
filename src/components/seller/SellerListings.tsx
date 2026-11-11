"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSeller } from "@/components/providers/SellerProvider";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { CATEGORIES } from "@/lib/categories";
import type { SellerListing } from "@/lib/seller";
import { AuthButton, AuthField } from "@/components/auth/AuthField";
import { SellerShell } from "./SellerShell";

const shopCategories = CATEGORIES.filter((c) => c.href !== "services-mode");

export function SellerListings() {
  const t = useTranslations("Seller");
  const { user } = useAuth();
  const { listings, saveListing, removeListing, ready } = useSeller();
  const { format } = useCurrency();
  const [editing, setEditing] = useState<SellerListing | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user || user.role !== "seller") {
    return (
      <SellerShell title={t("listingsTitle")} subtitle={t("listingsSub")}>
        <p className="text-[var(--muted)]">{t("loading")}</p>
      </SellerShell>
    );
  }

  function startNew() {
    const cat = shopCategories[0];
    setEditing({
      id: `listing-${Date.now()}`,
      name: "",
      categoryId: cat.id,
      category: cat.name,
      pricePkr: 1000,
      stock: 1,
      status: "draft",
      description: "",
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editing || !editing.name.trim()) return;
    const cat = shopCategories.find((c) => c.id === editing.categoryId) ?? shopCategories[0];
    setSaving(true);
    setError("");
    try {
      await saveListing({
        ...editing,
        name: editing.name.trim(),
        category: cat.name,
        description: editing.description.trim(),
      });
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SellerShell title={t("listingsTitle")} subtitle={t("listingsSub")}>
      {!ready ? (
        <p className="text-[var(--muted)]">{t("loading")}</p>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[var(--muted)]">
                {t("listingsCount", { count: listings.length })}
              </p>
              <p className="text-xs text-[var(--teal)]">{t("shopHint")}</p>
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

          <ul className="mb-6 grid gap-3">
            {listings.map((item) => (
              <li key={item.id} className="rounded-xl border border-[var(--line)] bg-[var(--cream)]/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {item.category} · {t(`listingStatus.${item.status}`)} · {t("stock")}: {item.stock}
                    </p>
                    <p className="mt-1 font-bold">{format(item.pricePkr)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="text-sm font-semibold text-[var(--teal)]" onClick={() => setEditing(item)}>
                      {t("edit")}
                    </button>
                    <button
                      type="button"
                      className="text-sm font-semibold text-[var(--sale)]"
                      onClick={() => {
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

          {editing ? (
            <form className="grid max-w-xl gap-3 rounded-xl border border-[var(--line)] bg-white p-4" onSubmit={onSubmit}>
              <h3 className="font-display text-lg font-semibold">{t("editListing")}</h3>
              <AuthField
                label={t("productName")}
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                required
              />
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">{t("category")}</span>
                <select
                  className="rounded-xl border border-[var(--line)] bg-[var(--cream)] px-3.5 py-3 outline-none"
                  value={editing.categoryId}
                  onChange={(e) => setEditing({ ...editing, categoryId: e.target.value })}
                >
                  {shopCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
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
                <span className="font-medium">{t("status")}</span>
                <select
                  className="rounded-xl border border-[var(--line)] bg-[var(--cream)] px-3.5 py-3 outline-none"
                  value={editing.status}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      status: e.target.value as SellerListing["status"],
                    })
                  }
                >
                  <option value="active">{t("listingStatus.active")}</option>
                  <option value="draft">{t("listingStatus.draft")}</option>
                  <option value="out">{t("listingStatus.out")}</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">{t("description")}</span>
                <textarea
                  rows={3}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="rounded-xl border border-[var(--line)] bg-[var(--cream)] px-3.5 py-3 outline-none focus:border-[var(--teal)] focus:bg-white"
                />
              </label>
              <p className="text-xs text-[var(--muted)]">{t("priceNote")}</p>
              {error ? <p className="text-sm font-medium text-[var(--sale)]">{error}</p> : null}
              <div className="flex max-w-sm gap-2">
                <AuthButton type="submit" disabled={saving}>
                  {t("saveListing")}
                </AuthButton>
                <AuthButton type="button" variant="ghost" onClick={() => setEditing(null)}>
                  {t("cancel")}
                </AuthButton>
              </div>
            </form>
          ) : null}
        </>
      )}
    </SellerShell>
  );
}
