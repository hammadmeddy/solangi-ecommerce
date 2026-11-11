import { setRequestLocale } from "next-intl/server";
import { HoldingPage } from "@/components/home/HoldingPage";

export default async function MlmPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HoldingPage titleKey="mlmTitle" bodyKey="mlmBody" />;
}
