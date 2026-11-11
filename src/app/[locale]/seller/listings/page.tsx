import { setRequestLocale } from "next-intl/server";
import { SellerListings } from "@/components/seller/SellerListings";

export default async function SellerListingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SellerListings />;
}
