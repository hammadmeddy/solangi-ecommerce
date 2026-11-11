import { setRequestLocale } from "next-intl/server";
import { VerifyForm } from "@/components/auth/VerifyForm";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <VerifyForm />;
}
