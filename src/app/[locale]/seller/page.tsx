import { setRequestLocale } from "next-intl/server";
import { SellerDashboard } from "@/components/seller/SellerDashboard";

export default async function SellerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SellerDashboard />;
}
