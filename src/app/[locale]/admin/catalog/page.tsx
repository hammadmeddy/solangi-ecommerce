import { setRequestLocale } from "next-intl/server";
import { AdminCatalog } from "@/components/admin/AdminCatalog";

export default async function AdminCatalogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminCatalog />;
}
