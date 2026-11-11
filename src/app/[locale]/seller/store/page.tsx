import { setRequestLocale } from "next-intl/server";
import { SellerStoreForm } from "@/components/seller/SellerStoreForm";

export default async function SellerStorePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SellerStoreForm />;
}
