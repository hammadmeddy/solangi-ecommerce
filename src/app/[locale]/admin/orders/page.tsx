import { setRequestLocale } from "next-intl/server";
import { AdminOrders } from "@/components/admin/AdminOrders";

export default async function AdminOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminOrders />;
}
