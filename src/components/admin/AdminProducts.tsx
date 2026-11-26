"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminShell } from "./AdminShell";
import { CATEGORIES, MODES } from "@/lib/categories";
import { UiDropdown } from "@/components/ui/UiDropdown";
import { apiGet, apiSend } from "@/lib/api-client";
import { useCurrency } from "@/components/providers/CurrencyProvider";

type AdminProduct = {
  id: string;
  name: string;
  categoryId: string;
  pricePkr: number;
  stock: number;
  status: string;
  mode: string;
  description: string;
  seller: string;
};

const emptyForm = {
  name: "",
  categoryId: "fashion",
  pricePkr: 1000,
  stock: 10,
  status: "active",
  mode: "retail",
  description: "",
  sellerName: "Solangi",
};

export function AdminProducts() {
  const t = useTranslations("Admin");
  const { format } = useCurrency();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = await apiGet<{ products: AdminProduct[] }>("/api/admin/products");
    setProducts(data.products || []);
  }

  useEffect(() => {
    void load().catch(() => setError(t("productsLoadFailed")));
  }, [t]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await apiSend("PATCH", `/api/admin/products/${editingId}`, form);
      } else {
        await apiSend("POST", "/api/admin/products", form);
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("productsSaveFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell title={t("productsTitle")} subtitle={t("productsSub")}>
      <form onSubmit={onSubmit} className="mb-8 grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--cream)]/40 p-4">
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder={t("productName")}
          className="rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <UiDropdown
            variant="field"
            ariaLabel={t("category")}
            label={t("category")}
            value={form.categoryId}
            options={CATEGORIES.filter((c) => c.id !== "services").map((c) => ({
              value: c.id,
              label: c.name,
            }))}
            onChange={(categoryId) => setForm({ ...form, categoryId })}
          />
          <UiDropdown
            variant="field"
            ariaLabel={t("mode")}
            label={t("mode")}
            value={form.mode}
            options={MODES.map((mode) => ({ value: mode.id, label: mode.label }))}
            onChange={(mode) => setForm({ ...form, mode })}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            required
            type="number"
            min={1}
            value={form.pricePkr}
            onChange={(e) => setForm({ ...form, pricePkr: Number(e.target.value) || 0 })}
            className="rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
            aria-label={t("pricePkr")}
          />
          <input
            required
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) || 0 })}
            className="rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
            aria-label={t("stock")}
          />
          <UiDropdown
            variant="field"
            ariaLabel={t("status")}
            value={form.status}
            options={[
              { value: "active", label: t("statusActive") },
              { value: "draft", label: t("statusDraft") },
              { value: "out", label: t("statusOut") },
              { value: "pending", label: t("statusPending") },
              { value: "rejected", label: t("statusRejected") },
            ]}
            onChange={(status) => setForm({ ...form, status })}
          />
        </div>
        <textarea
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder={t("description")}
          className="rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
        />
        {error ? <p className="text-sm text-[var(--sale)]">{error}</p> : null}
        <button
          type="submit"
          disabled={saving}
          className="justify-self-start rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-[var(--cream)] disabled:opacity-50"
        >
          {editingId ? t("saveProduct") : t("addProduct")}
        </button>
      </form>

      <div className="grid gap-2">
        {products.map((product) => (
          <article
            key={product.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] px-3 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{product.name}</p>
              <p className="text-xs text-[var(--muted)]">
                {product.status} · {product.mode} · {t("stock")} {product.stock} · {format(product.pricePkr)}
              </p>
            </div>
            <div className="flex gap-3 text-xs font-semibold">
              <button
                type="button"
                className="text-[var(--teal)]"
                onClick={() => {
                  setEditingId(product.id);
                  setForm({
                    name: product.name,
                    categoryId: product.categoryId,
                    pricePkr: product.pricePkr,
                    stock: product.stock,
                    status: product.status,
                    mode: product.mode,
                    description: product.description,
                    sellerName: product.seller,
                  });
                }}
              >
                {t("edit")}
              </button>
              <button
                type="button"
                className="text-[var(--sale)]"
                onClick={() => {
                  void apiSend("DELETE", `/api/admin/products/${product.id}`)
                    .then(load)
                    .catch((err) => setError(err instanceof Error ? err.message : t("productsSaveFailed")));
                }}
              >
                {t("delete")}
              </button>
            </div>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
