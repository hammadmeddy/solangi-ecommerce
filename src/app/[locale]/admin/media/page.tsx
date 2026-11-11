import { setRequestLocale } from "next-intl/server";
import { AdminMedia } from "@/components/admin/AdminMedia";

export default async function AdminMediaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminMedia />;
}
