"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminShell } from "./AdminShell";
import {
  EmptyState,
  FilterTabs,
  toastDecision,
  type EmailOutcome,
  StatusPill,
  dangerBtn,
  ghostBtn,
  inputClass,
  primaryBtn,
} from "./AdminBits";
import { apiGet, apiSend } from "@/lib/api-client";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useToast } from "@/components/ui/Toaster";
import type { SellerBalance } from "@/lib/earnings";

type StoreStatus = "pending" | "approved" | "rejected" | "suspended";

type AdminSeller = {
  id: string;
  userId: string;
  name: string;
  slug: string;
  city: string;
  phone: string;
  bio: string;
  cnic: string | null;
  verified: boolean;
  status: StoreStatus;
  commissionPct: number | null;
  rejectionReason: string | null;
  appliedAt: string;
  reviewedAt: string | null;
  user: { id: string; name: string; phone: string; email: string | null; role: string; status: string };
  listingCounts: Record<string, number>;
  balance: SellerBalance | null;
};

type Action =
  | { action: "approve" }
  | { action: "reject"; reason: string }
  | { action: "suspend"; reason?: string }
  | { action: "reinstate" }
  | { action: "verify"; verified: boolean }
  | { action: "commission"; commissionPct: number | null }
  | { action: "edit"; name: string; slug: string; city: string; phone: string; bio: string };

export function AdminSellers() {
  const t = useTranslations("Admin");
  const { format } = useCurrency();
  const toast = useToast();
  const [filter, setFilter] = useState<StoreStatus | "">("pending");
  const [sellers, setSellers] = useState<AdminSeller[]>([]);
  const [all, setAll] = useState<AdminSeller[]>([]);
  const [defaultPct, setDefaultPct] = useState(10);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await apiGet<{ sellers: AdminSeller[]; defaultCommissionPct: number }>(
        "/api/admin/sellers",
      );
      setAll(data.sellers);
      setDefaultPct(data.defaultCommissionPct);
      setError("");
    } catch {
      setError(t("sellersLoadFailed"));
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setSellers(filter ? all.filter((s) => s.status === filter) : all);
  }, [all, filter]);

  const count = (s: StoreStatus) => all.filter((row) => row.status === s).length;

  async function act(seller: AdminSeller, body: Action) {
    setBusyId(seller.id);
    try {
      const res = await apiSend<{ email?: EmailOutcome }>("PATCH", `/api/admin/sellers/${seller.id}`, body);
      toastDecision(toast, t, t("sellerSaved"), res.email);
      setEditingId(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("sellerSaveFailed"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminShell title={t("sellersTitle")} subtitle={t("sellersSub")}>
      {error ? <p className="mb-4 text-sm text-[var(--sale)]">{error}</p> : null}
      <FilterTabs<StoreStatus | "">
        value={filter}
        onChange={setFilter}
        options={[
          { value: "pending", label: t("store_pending"), count: count("pending") },
          { value: "approved", label: t("store_approved"), count: count("approved") },
          { value: "suspended", label: t("store_suspended"), count: count("suspended") },
          { value: "rejected", label: t("store_rejected"), count: count("rejected") },
          { value: "", label: t("filterAll") },
        ]}
      />

      {sellers.length === 0 ? (
        <EmptyState>{filter === "pending" ? t("sellersNonePending") : t("sellersEmpty")}</EmptyState>
      ) : (
        <div className="grid gap-3">
          {sellers.map((s) => {
            const busy = busyId === s.id;
            const live = s.listingCounts.active ?? 0;
            const pending = s.listingCounts.pending ?? 0;
            return (
              <article key={s.id} className="rounded-xl border border-[var(--line)] bg-[var(--cream)]/50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="flex flex-wrap items-center gap-2 text-base font-semibold">
                      {s.name}
                      <StatusPill status={s.status} label={t(`store_${s.status}`)} />
                      {s.verified ? <StatusPill status="active" label={t("verified")} /> : null}
                    </h2>
                    <p className="text-xs text-[var(--muted)]">
                      {s.user.name} · {s.phone} · {s.city}
                      {s.user.email ? ` · ${s.user.email}` : ""}
                      {s.cnic ? ` · CNIC ${s.cnic}` : ""}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {t("appliedOn")} {s.appliedAt.slice(0, 10)}
                      {s.reviewedAt ? ` · ${t("reviewedOn")} ${s.reviewedAt.slice(0, 10)}` : ""}
                    </p>
                    {s.bio ? <p className="mt-2 max-w-[60ch] text-sm">{s.bio}</p> : null}
                    {s.rejectionReason ? (
                      <p className="mt-2 text-sm text-[var(--sale)]">
                        {t("reason")}: {s.rejectionReason}
                      </p>
                    ) : null}
                  </div>

                  {s.status === "approved" || s.status === "suspended" ? (
                    <div className="grid min-w-[180px] gap-1 text-right text-xs">
                      <span>{t("sellerListings", { live, pending })}</span>
                      {s.balance ? (
                        <>
                          <span>
                            {t("sellerSales")}: <strong>{format(s.balance.grossPkr)}</strong>
                          </span>
                          <span>
                            {t("sellerAvailable")}: <strong>{format(s.balance.availablePkr)}</strong>
                          </span>
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {s.status === "pending" || s.status === "rejected" ? (
                    <button type="button" className={primaryBtn} disabled={busy} onClick={() => void act(s, { action: "approve" })}>
                      {t("approve")}
                    </button>
                  ) : null}
                  {s.status === "pending" ? (
                    <button
                      type="button"
                      className={dangerBtn}
                      disabled={busy}
                      onClick={() => {
                        const reason = prompt(t("rejectPrompt"))?.trim();
                        if (reason && reason.length >= 3) void act(s, { action: "reject", reason });
                      }}
                    >
                      {t("reject")}
                    </button>
                  ) : null}
                  {s.status === "approved" ? (
                    <>
                      <button
                        type="button"
                        className={ghostBtn}
                        disabled={busy}
                        onClick={() => void act(s, { action: "verify", verified: !s.verified })}
                      >
                        {s.verified ? t("unverify") : t("verify")}
                      </button>
                      <CommissionField
                        value={s.commissionPct}
                        defaultPct={defaultPct}
                        disabled={busy}
                        onSave={(pct) => void act(s, { action: "commission", commissionPct: pct })}
                      />
                      <button type="button" className={ghostBtn} disabled={busy} onClick={() => setEditingId(editingId === s.id ? null : s.id)}>
                        {t("edit")}
                      </button>
                      <button
                        type="button"
                        className={dangerBtn}
                        disabled={busy}
                        onClick={() => {
                          const reason = prompt(t("suspendPrompt", { name: s.name }));
                          if (reason !== null) void act(s, { action: "suspend", reason: reason.trim() || undefined });
                        }}
                      >
                        {t("suspend")}
                      </button>
                    </>
                  ) : null}
                  {s.status === "suspended" ? (
                    <button type="button" className={primaryBtn} disabled={busy} onClick={() => void act(s, { action: "reinstate" })}>
                      {t("reinstate")}
                    </button>
                  ) : null}
                </div>

                {editingId === s.id ? (
                  <StoreEditForm seller={s} busy={busy} onSave={(body) => void act(s, { action: "edit", ...body })} />
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}

function CommissionField({
  value,
  defaultPct,
  disabled,
  onSave,
}: {
  value: number | null;
  defaultPct: number;
  disabled: boolean;
  onSave: (pct: number | null) => void;
}) {
  const t = useTranslations("Admin");
  const [text, setText] = useState(value == null ? "" : String(value));
  useEffect(() => setText(value == null ? "" : String(value)), [value]);
  const changed = text !== (value == null ? "" : String(value));
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <label className="inline-flex items-center gap-1.5">
        {t("commission")}
        <input
          type="number"
          min={0}
          max={90}
          value={text}
          placeholder={String(defaultPct)}
          onChange={(e) => setText(e.target.value)}
          className={`${inputClass} !w-16 !px-2 !py-1.5`}
        />
        %
      </label>
      {changed ? (
        <button
          type="button"
          disabled={disabled}
          className="font-semibold text-[var(--teal)]"
          onClick={() => onSave(text.trim() === "" ? null : Math.max(0, Math.min(90, Number(text) || 0)))}
        >
          {t("save")}
        </button>
      ) : null}
    </span>
  );
}

function StoreEditForm({
  seller,
  busy,
  onSave,
}: {
  seller: AdminSeller;
  busy: boolean;
  onSave: (body: { name: string; slug: string; city: string; phone: string; bio: string }) => void;
}) {
  const t = useTranslations("Admin");
  const [form, setForm] = useState({
    name: seller.name,
    slug: seller.slug,
    city: seller.city,
    phone: seller.phone,
    bio: seller.bio,
  });
  function submit(e: FormEvent) {
    e.preventDefault();
    onSave(form);
  }
  return (
    <form onSubmit={submit} className="mt-3 grid gap-2 border-t border-[var(--line)] pt-3 sm:grid-cols-2">
      {(["name", "slug", "city", "phone"] as const).map((key) => (
        <label key={key} className="grid gap-1 text-xs font-medium">
          {t(`storeField_${key}`)}
          <input
            required
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className={inputClass}
          />
        </label>
      ))}
      <label className="grid gap-1 text-xs font-medium sm:col-span-2">
        {t("storeField_bio")}
        <textarea
          rows={2}
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          className={inputClass}
        />
      </label>
      <button type="submit" disabled={busy} className={`${primaryBtn} justify-self-start`}>
        {t("save")}
      </button>
    </form>
  );
}
