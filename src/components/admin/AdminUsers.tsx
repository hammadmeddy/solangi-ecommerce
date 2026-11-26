"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminShell } from "./AdminShell";
import { EmptyState, FilterTabs, StatusPill, dangerBtn, ghostBtn, inputClass } from "./AdminBits";
import { UiDropdown } from "@/components/ui/UiDropdown";
import { apiGet, apiSend } from "@/lib/api-client";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useToast } from "@/components/ui/Toaster";
import type { PlacedOrder } from "@/lib/cart";

type AdminUser = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  status: string;
  city: string | null;
  orderCount: number;
  createdAt: string;
  store: { id: string; name: string; status: string } | null;
};

type UserDetail = AdminUser & {
  addresses: { id: string; label: string; line1: string; city: string }[];
  orders: PlacedOrder[];
};

type RoleFilter = "" | "customer" | "seller" | "admin" | "suspended";

export function AdminUsers() {
  const t = useTranslations("Admin");
  const tc = useTranslations("Customer");
  const { user: me } = useAuth();
  const { format } = useCurrency();
  const toast = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filter, setFilter] = useState<RoleFilter>("");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filter === "suspended") params.set("status", "suspended");
    else if (filter) params.set("role", filter);
    try {
      const data = await apiGet<{ users: AdminUser[] }>(`/api/admin/users?${params}`);
      setUsers(data.users || []);
      setError("");
    } catch {
      setError(t("usersLoadFailed"));
    }
  }, [filter, query, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const id = setTimeout(() => setQuery(q.trim()), 300);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    if (!openId) {
      setDetail(null);
      return;
    }
    void apiGet<{ user: UserDetail }>(`/api/admin/users/${openId}`)
      .then((d) => setDetail(d.user))
      .catch(() => setDetail(null));
  }, [openId]);

  async function patch(user: AdminUser, body: { role?: string; status?: string }) {
    setBusyId(user.id);
    try {
      const res = await apiSend<{ user: AdminUser }>("PATCH", `/api/admin/users/${user.id}`, body);
      setUsers((prev) => prev.map((row) => (row.id === user.id ? { ...row, ...res.user } : row)));
      toast.success(t("userSaved"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("usersSaveFailed"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminShell title={t("usersTitle")} subtitle={t("usersSub")}>
      {error ? <p className="mb-4 text-sm text-[var(--sale)]">{error}</p> : null}
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("usersSearch")}
        aria-label={t("usersSearch")}
        className={`${inputClass} mb-3 w-full`}
      />
      <FilterTabs<RoleFilter>
        value={filter}
        onChange={setFilter}
        options={[
          { value: "", label: t("filterAll") },
          { value: "customer", label: t("roleCustomer") },
          { value: "seller", label: t("roleSeller") },
          { value: "admin", label: t("roleAdmin") },
          { value: "suspended", label: t("statusSuspended") },
        ]}
      />

      {users.length === 0 ? (
        <EmptyState>{t("usersEmpty")}</EmptyState>
      ) : (
        <div className="grid gap-2">
          {users.map((user) => {
            const self = user.id === me?.id;
            const open = openId === user.id;
            return (
              <article key={user.id} className="rounded-xl border border-[var(--line)] px-3 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    className="min-w-0 text-left"
                    onClick={() => setOpenId(open ? null : user.id)}
                    aria-expanded={open}
                  >
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                      {user.name}
                      {user.status === "suspended" ? (
                        <StatusPill status="suspended" label={t("statusSuspended")} />
                      ) : null}
                      {user.store && user.store.status !== "approved" ? (
                        <StatusPill
                          status={user.store.status}
                          label={t(`store_${user.store.status}`)}
                        />
                      ) : null}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {user.phone}
                      {user.email ? ` · ${user.email}` : ""} ·{" "}
                      {t("userOrders", { n: user.orderCount })}
                    </p>
                  </button>
                  <div className="flex flex-wrap items-center gap-2">
                    <UiDropdown
                      variant="compact"
                      ariaLabel={t("role")}
                      value={user.role}
                      disabled={self || busyId === user.id}
                      options={[
                        { value: "customer", label: t("roleCustomer") },
                        { value: "seller", label: t("roleSeller") },
                        { value: "admin", label: t("roleAdmin") },
                      ]}
                      onChange={(role) => {
                        if (role === "admin" && !confirm(t("confirmMakeAdmin", { name: user.name }))) return;
                        void patch(user, { role });
                      }}
                    />
                    {self ? null : user.status === "active" ? (
                      <button
                        type="button"
                        className={`${dangerBtn} !px-3 !py-1.5 text-xs`}
                        disabled={busyId === user.id}
                        onClick={() => {
                          if (confirm(t("confirmSuspend", { name: user.name }))) {
                            void patch(user, { status: "suspended" });
                          }
                        }}
                      >
                        {t("suspend")}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={`${ghostBtn} !px-3 !py-1.5 text-xs`}
                        disabled={busyId === user.id}
                        onClick={() => void patch(user, { status: "active" })}
                      >
                        {t("reactivate")}
                      </button>
                    )}
                  </div>
                </div>

                {open ? (
                  <div className="mt-3 grid gap-3 border-t border-[var(--line)] pt-3 text-sm">
                    {!detail ? (
                      <p className="text-[var(--muted)]">{t("loading")}</p>
                    ) : (
                      <>
                        <p className="text-xs text-[var(--muted)]">
                          {t("joined")} {detail.createdAt.slice(0, 10)}
                          {detail.city ? ` · ${detail.city}` : ""}
                          {detail.store ? ` · ${t("storeLabel")}: ${detail.store.name}` : ""}
                        </p>
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                            {t("addresses")}
                          </p>
                          {detail.addresses.length === 0 ? (
                            <p className="text-xs text-[var(--muted)]">—</p>
                          ) : (
                            <ul className="grid gap-1 text-xs">
                              {detail.addresses.map((a) => (
                                <li key={a.id}>
                                  <strong>{a.label}</strong> · {a.line1}, {a.city}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                            {t("recentOrders")}
                          </p>
                          {detail.orders.length === 0 ? (
                            <p className="text-xs text-[var(--muted)]">—</p>
                          ) : (
                            <ul className="grid gap-1 text-xs">
                              {detail.orders.map((o) => (
                                <li key={o.id} className="flex flex-wrap items-center gap-2">
                                  <strong>{o.id}</strong> {o.placedAt} · {format(o.totalPkr)}
                                  <StatusPill status={o.status} label={tc(`status.${o.status}`)} />
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
