import { setRequestLocale } from "next-intl/server";
import { CustomerProfile } from "@/components/customer/CustomerProfile";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CustomerProfile />;
}
