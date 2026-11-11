import { setRequestLocale } from "next-intl/server";
import { CustomerAddresses } from "@/components/customer/CustomerAddresses";

export default async function AddressesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CustomerAddresses />;
}
