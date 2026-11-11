import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { MODES, type ModeId } from "@/lib/categories";
import { ModeMarketplace } from "@/components/modes/ModeMarketplace";

export function generateStaticParams() {
  return MODES.map((mode) => ({ mode: mode.id }));
}

export default async function ModePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; mode: string }>;
  searchParams: Promise<{ cat?: string }>;
}) {
  const { locale, mode } = await params;
  const { cat } = await searchParams;
  setRequestLocale(locale);
  const known = MODES.some((m) => m.id === mode);
  if (!known) notFound();

  return <ModeMarketplace mode={mode as ModeId} initialCategory={cat} />;
}
