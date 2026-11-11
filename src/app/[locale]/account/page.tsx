import { setRequestLocale } from "next-intl/server";
import { AccountGateOrDashboard } from "@/components/customer/AccountGateOrDashboard";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AccountGateOrDashboard />;
}
