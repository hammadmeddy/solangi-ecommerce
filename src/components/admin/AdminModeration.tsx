"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminShell } from "./AdminShell";
import {
  EmptyState,
  FilterTabs,
  StatusPill,
  dangerBtn,
  primaryBtn,
  toastDecision,
  type EmailOutcome,
} from "./AdminBits";
import { apiGet, apiSend } from "@/lib/api-client";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useToast } from "@/components/ui/Toaster";

type Listing = {
  id: string;
  name: string;
  category: string;
  pricePkr: number;
  stock: number;
  status: string;
  description: string;
  seller: string;
  sellerId: string | null;
  imageUrl?: string;
  reviewNote: string | null;
  updatedAt: string;
};

type Tab = "pending" | "rejected";

/** Review queue for seller listings: approve to publish, or reject with a note. */
export function AdminModeration() {
  const t = useTranslations("Admin");
  const { format } = useCurrency();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("pending");
  const [items, setItems] = useState<Listing[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await apiGet<{ products: Listing[] }>(`/api/admin/products?status=${tab}`);
      setItems((data.products || []).filter((p) => p.sellerId));
      setError("");
    } catch {
      setError(t("productsLoadFailed"));
    }
  }, [tab, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function decide(item: Listing, status: "active" | "rejected", reviewNote?: string) {
    setBusyId(item.id);
    try {
      const res = await apiSend<{ email?: EmailOutcome }>("PATCH", `/api/admin/products/${item.id}`, {
        status,
        reviewNote: reviewNote ?? null,
      });
      setItems((prev) => prev.filter((p) => p.id !== item.id));
      toastDecision(toast, t, status === "active" ? t("listingApproved") : t("listingRejected"), res.email);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("productsSaveFailed"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminShell title={t("moderationTitle")} subtitle={t("moderationSub")}>
      {error ? <p className="mb-4 text-sm text-[var(--sale)]">{error}</p> : null}
      <FilterTabs<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: "pending", label: t("statusPending") },
          { value: "rejected", label: t("statusRejected") },
        ]}
      />
      {items.length === 0 ? (
        <EmptyState>{tab === "pending" ? t("moderationEmpty") : t("moderationNoRejected")}</EmptyState>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <article key={item.id} className="flex flex-wrap gap-4 rounded-xl border border-[var(--line)] bg-[var(--cream)]/50 p-4">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt="" className="h-20 w-20 rounded-lg object-cover" />
              ) : null}
              <div className="min-w-0 flex-1">
                <h2 className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  {item.name}
                  <StatusPill status={item.status} label={t(`status${item.status === "pending" ? "Pending" : "Rejected"}`)} />
                </h2>
                <p className="text-xs text-[var(--muted)]">
                  {item.seller} · {item.category} · {format(item.pricePkr)} · {t("stock")} {item.stock} ·{" "}
                  {item.updatedAt.slice(0, 10)}
                </p>
                <p className="mt-2 max-w-[70ch] text-sm">{item.description}</p>
                {item.reviewNote ? (
                  <p className="mt-1 text-xs text-[var(--sale)]">
                    {t("reason")}: {item.reviewNote}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={primaryBtn}
                    disabled={busyId === item.id}
                    onClick={() => void decide(item, "active")}
                  >
                    {t("approvePublish")}
                  </button>
                  {item.status === "pending" ? (
                    <button
                      type="button"
                      className={dangerBtn}
                      disabled={busyId === item.id}
                      onClick={() => {
                        const note = prompt(t("rejectListingPrompt"))?.trim();
                        if (note) void decide(item, "rejected", note);
                      }}
                    >
                      {t("reject")}
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
