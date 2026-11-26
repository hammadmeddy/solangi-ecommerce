import { setRequestLocale } from "next-intl/server";
import { AdminModeration } from "@/components/admin/AdminModeration";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminModeration />;
}
