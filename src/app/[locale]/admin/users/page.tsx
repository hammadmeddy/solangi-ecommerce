import { setRequestLocale } from "next-intl/server";
import { AdminUsers } from "@/components/admin/AdminUsers";

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminUsers />;
}
