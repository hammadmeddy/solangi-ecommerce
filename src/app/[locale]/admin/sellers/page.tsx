import { setRequestLocale } from "next-intl/server";
import { AdminSellers } from "@/components/admin/AdminSellers";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminSellers />;
}
