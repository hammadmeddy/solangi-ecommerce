import { setRequestLocale } from "next-intl/server";
import { SellerEarnings } from "@/components/seller/SellerEarnings";

export default async function SellerEarningsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SellerEarnings />;
}
