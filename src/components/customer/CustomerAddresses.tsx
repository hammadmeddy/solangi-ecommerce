"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCustomer } from "@/components/providers/CustomerProvider";
import type { CustomerAddress } from "@/lib/customer";
import { AuthButton, AuthField } from "@/components/auth/AuthField";
import { CustomerShell } from "./CustomerShell";

export function CustomerAddresses() {
  const t = useTranslations("Customer");
  const { user } = useAuth();
  const { addresses, saveAddress, removeAddress, ready } = useCustomer();
  const [editing, setEditing] = useState<CustomerAddress | null>(null);

  if (!user) return null;

  function startNew() {
    setEditing({
      id: `addr-${Date.now()}`,
      label: "Home",
      fullName: user?.name ?? "",
      phone: user?.phone ?? "",
      line1: "",
      line2: "",
      city: "",
      province: "",
      isDefault: addresses.length === 0,
    });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (!editing.line1.trim() || !editing.city.trim()) return;
    saveAddress(editing);
    setEditing(null);
  }

  return (
    <CustomerShell title={t("addressesTitle")} subtitle={t("addressesSub")}>
      {!ready ? (
        <p className="text-[var(--muted)]">{t("loading")}</p>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--muted)]">{t("addressesCount", { count: addresses.length })}</p>
            <button
              type="button"
              onClick={startNew}
              className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-[var(--cream)] hover:bg-[var(--teal)]"
            >
              {t("addAddress")}
            </button>
          </div>

          <ul className="mb-6 grid gap-3">
            {addresses.map((addr) => (
              <li key={addr.id} className="rounded-xl border border-[var(--line)] bg-[var(--cream)]/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {addr.label}
                      {addr.isDefault ? (
                        <span className="ml-2 rounded-full bg-[var(--teal-soft)] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-[var(--teal)]">
                          {t("default")}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {addr.fullName} · {addr.phone}
                      <br />
                      {addr.line1}
                      {addr.line2 ? `, ${addr.line2}` : ""}
                      <br />
                      {addr.city}, {addr.province}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-sm font-semibold text-[var(--teal)]"
                      onClick={() => setEditing(addr)}
                    >
                      {t("edit")}
                    </button>
                    <button
                      type="button"
                      className="text-sm font-semibold text-[var(--sale)]"
                      onClick={() => removeAddress(addr.id)}
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
              <h3 className="font-display text-lg font-semibold">{t("editAddress")}</h3>
              <AuthField
                label={t("label")}
                value={editing.label}
                onChange={(e) => setEditing({ ...editing, label: e.target.value })}
              />
              <AuthField
                label={t("fullName")}
                value={editing.fullName}
                onChange={(e) => setEditing({ ...editing, fullName: e.target.value })}
              />
              <AuthField
                label={t("phone")}
                value={editing.phone}
                onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
              />
              <AuthField
                label={t("line1")}
                value={editing.line1}
                onChange={(e) => setEditing({ ...editing, line1: e.target.value })}
                required
              />
              <AuthField
                label={t("line2")}
                value={editing.line2 ?? ""}
                onChange={(e) => setEditing({ ...editing, line2: e.target.value })}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <AuthField
                  label={t("city")}
                  value={editing.city}
                  onChange={(e) => setEditing({ ...editing, city: e.target.value })}
                  required
                />
                <AuthField
                  label={t("province")}
                  value={editing.province}
                  onChange={(e) => setEditing({ ...editing, province: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.isDefault}
                  onChange={(e) => setEditing({ ...editing, isDefault: e.target.checked })}
                />
                {t("makeDefault")}
              </label>
              <div className="flex max-w-sm gap-2">
                <AuthButton type="submit">{t("saveAddress")}</AuthButton>
                <AuthButton type="button" variant="ghost" onClick={() => setEditing(null)}>
                  {t("cancel")}
                </AuthButton>
              </div>
            </form>
          ) : null}
        </>
      )}
    </CustomerShell>
  );
}
