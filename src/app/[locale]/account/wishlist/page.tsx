import { setRequestLocale } from "next-intl/server";
import { CustomerWishlist } from "@/components/customer/CustomerWishlist";

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CustomerWishlist />;
}
