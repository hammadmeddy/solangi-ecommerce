import { setRequestLocale } from "next-intl/server";
import { AdminProducts } from "@/components/admin/AdminProducts";

export default async function AdminProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminProducts />;
}
