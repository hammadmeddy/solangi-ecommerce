import { setRequestLocale } from "next-intl/server";
import { ForgotForm } from "@/components/auth/ForgotForm";

export default async function ForgotPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ForgotForm />;
}
