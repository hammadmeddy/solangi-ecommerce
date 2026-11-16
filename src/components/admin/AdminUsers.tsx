"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminShell } from "./AdminShell";
import { UiDropdown } from "@/components/ui/UiDropdown";
import { apiGet, apiSend } from "@/lib/api-client";

type AdminUser = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: string;
};

export function AdminUsers() {
  const t = useTranslations("Admin");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiGet<{ users: AdminUser[] }>("/api/admin/users")
      .then((data) => setUsers(data.users || []))
      .catch(() => setError(t("usersLoadFailed")));
  }, [t]);

  return (
    <AdminShell title={t("usersTitle")} subtitle={t("usersSub")}>
      {error ? <p className="mb-4 text-sm text-[var(--sale)]">{error}</p> : null}
      <div className="grid gap-2">
        {users.map((user) => (
          <article
            key={user.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] px-3 py-3"
          >
            <div>
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-[var(--muted)]">
                {user.phone}
                {user.email ? ` · ${user.email}` : ""}
              </p>
            </div>
            <UiDropdown
              variant="compact"
              ariaLabel={t("role")}
              value={user.role}
              options={[
                { value: "customer", label: t("roleCustomer") },
                { value: "seller", label: t("roleSeller") },
                { value: "admin", label: t("roleAdmin") },
              ]}
              onChange={(role) => {
                void apiSend("PATCH", `/api/admin/users/${user.id}`, { role })
                  .then(() =>
                    setUsers((prev) => prev.map((row) => (row.id === user.id ? { ...row, role } : row))),
                  )
                  .catch((err) => setError(err instanceof Error ? err.message : t("usersSaveFailed")));
              }}
            />
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
