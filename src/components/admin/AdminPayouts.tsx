"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminShell } from "./AdminShell";
import { EmptyState, StatusPill, ghostBtn, inputClass, primaryBtn } from "./AdminBits";
import { apiGet, apiSend } from "@/lib/api-client";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useToast } from "@/components/ui/Toaster";
import { UiDropdown } from "@/components/ui/UiDropdown";
import type { SellerBalance } from "@/lib/earnings";

type SellerRow = { userId: string; name: string; phone: string; balance?: SellerBalance };
type PayoutRow = {
  id: string;
  sellerId: string;
  storeName: string;
  amountPkr: number;
  periodLabel: string;
  status: "pending" | "paid";
  note: string;
  paidAt: string | null;
  createdAt: string;
};

export function AdminPayouts() {
  const t = useTranslations("Admin");
  const { format } = useCurrency();
  const toast = useToast();
  const [sellers, setSellers] = useState<SellerRow[]>([]);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [form, setForm] = useState({ sellerId: "", amountPkr: 0, periodLabel: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await apiGet<{ sellers: SellerRow[]; payouts: PayoutRow[] }>("/api/admin/payouts");
      setSellers(data.sellers);
      setPayouts(data.payouts);
      setError("");
    } catch {
      setError(t("payoutsLoadFailed"));
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = sellers.find((s) => s.userId === form.sellerId);

  async function record(e: FormEvent) {
    e.preventDefault();
    if (!form.sellerId || form.amountPkr <= 0) return;
    setBusy(true);
    try {
      await apiSend("POST", "/api/admin/payouts", form);
      toast.success(t("payoutRecorded"));
      setForm({ sellerId: "", amountPkr: 0, periodLabel: "", note: "" });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("payoutFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function markPaid(p: PayoutRow) {
    const note = prompt(t("markPaidPrompt", { amount: format(p.amountPkr), store: p.storeName }));
    if (note === null) return;
    setBusy(true);
    try {
      await apiSend("PATCH", `/api/admin/payouts/${p.id}`, { status: "paid", note: note.trim() || undefined });
      toast.success(t("payoutPaid"));
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("payoutFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function remove(p: PayoutRow) {
    if (!confirm(t("payoutDeleteConfirm"))) return;
    setBusy(true);
    try {
      await apiSend("DELETE", `/api/admin/payouts/${p.id}`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("payoutFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminShell title={t("payoutsTitle")} subtitle={t("payoutsSub")}>
      {error ? <p className="mb-4 text-sm text-[var(--sale)]">{error}</p> : null}

      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
        {t("balances")}
      </h2>
      {sellers.length === 0 ? (
        <EmptyState>{t("sellersEmpty")}</EmptyState>
      ) : (
        <div className="mb-8 overflow-x-auto rounded-xl border border-[var(--line)]">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-[var(--mist)]/60 text-left text-xs uppercase tracking-wider text-[var(--muted)]">
              <tr>
                <th className="px-3 py-2">{t("storeLabel")}</th>
                <th className="px-3 py-2 text-right">{t("sellerSales")}</th>
                <th className="px-3 py-2 text-right">{t("commission")}</th>
                <th className="px-3 py-2 text-right">{t("paid")}</th>
                <th className="px-3 py-2 text-right">{t("sellerAvailable")}</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {sellers.map((s) => (
                <tr key={s.userId} className="border-t border-[var(--line)]">
                  <td className="px-3 py-2 font-medium">{s.name}</td>
                  <td className="px-3 py-2 text-right">{format(s.balance?.grossPkr ?? 0)}</td>
                  <td className="px-3 py-2 text-right">{format(s.balance?.commissionPkr ?? 0)}</td>
                  <td className="px-3 py-2 text-right">{format(s.balance?.paidPkr ?? 0)}</td>
                  <td className="px-3 py-2 text-right font-semibold">{format(s.balance?.availablePkr ?? 0)}</td>
                  <td className="px-3 py-2 text-right">
                    {(s.balance?.availablePkr ?? 0) > 0 ? (
                      <button
                        type="button"
                        className="text-xs font-semibold text-[var(--teal)]"
                        onClick={() =>
                          setForm({ ...form, sellerId: s.userId, amountPkr: s.balance?.availablePkr ?? 0 })
                        }
                      >
                        {t("payThis")}
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form onSubmit={record} className="mb-8 grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--cream)]/40 p-4">
        <h2 className="text-sm font-semibold">{t("recordPayout")}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <UiDropdown
            variant="field"
            ariaLabel={t("storeLabel")}
            label={t("storeLabel")}
            value={form.sellerId}
            options={[
              { value: "", label: t("chooseSeller") },
              ...sellers.map((s) => ({ value: s.userId, label: s.name })),
            ]}
            onChange={(sellerId) => setForm({ ...form, sellerId })}
          />
          <label className="grid gap-1 text-xs font-medium">
            {t("amountPkr")}
            <input
              type="number"
              min={1}
              max={selected?.balance?.availablePkr ?? undefined}
              value={form.amountPkr || ""}
              onChange={(e) => setForm({ ...form, amountPkr: Number(e.target.value) || 0 })}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1 text-xs font-medium">
            {t("period")}
            <input
              value={form.periodLabel}
              placeholder={t("periodPh")}
              onChange={(e) => setForm({ ...form, periodLabel: e.target.value })}
              className={inputClass}
            />
          </label>
        </div>
        <input
          value={form.note}
          placeholder={t("payoutNotePh")}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          className={inputClass}
        />
        {selected?.balance ? (
          <p className="text-xs text-[var(--muted)]">
            {t("availableFor", { store: selected.name, amount: format(selected.balance.availablePkr) })}
          </p>
        ) : null}
        <button type="submit" disabled={busy || !form.sellerId || form.amountPkr <= 0} className={`${primaryBtn} justify-self-start`}>
          {t("recordPayout")}
        </button>
      </form>

      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
        {t("ledger")}
      </h2>
      {payouts.length === 0 ? (
        <EmptyState>{t("payoutsEmpty")}</EmptyState>
      ) : (
        <ul className="grid gap-2">
          {payouts.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] px-3 py-3 text-sm">
              <div>
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {p.storeName} · {format(p.amountPkr)}
                  <StatusPill status={p.status} label={t(`payout_${p.status}`)} />
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {p.createdAt.slice(0, 10)}
                  {p.periodLabel ? ` · ${p.periodLabel}` : ""}
                  {p.paidAt ? ` · ${t("paidOn")} ${p.paidAt.slice(0, 10)}` : ""}
                  {p.note ? ` · ${p.note}` : ""}
                </p>
              </div>
              {p.status === "pending" ? (
                <div className="flex gap-2">
                  <button type="button" className={primaryBtn} disabled={busy} onClick={() => void markPaid(p)}>
                    {t("markPaid")}
                  </button>
                  <button type="button" className={ghostBtn} disabled={busy} onClick={() => void remove(p)}>
                    {t("delete")}
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
