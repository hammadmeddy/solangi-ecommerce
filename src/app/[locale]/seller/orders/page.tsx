import { setRequestLocale } from "next-intl/server";
import { SellerOrders } from "@/components/seller/SellerOrders";

export default async function SellerOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SellerOrders />;
}
