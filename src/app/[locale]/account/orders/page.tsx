import { setRequestLocale } from "next-intl/server";
import { CustomerOrders } from "@/components/customer/CustomerOrders";

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CustomerOrders />;
}
