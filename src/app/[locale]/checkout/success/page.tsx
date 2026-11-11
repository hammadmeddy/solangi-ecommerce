import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { CheckoutSuccess } from "@/components/cart/CheckoutSuccess";

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense fallback={<div className="wrap py-16 text-[var(--muted)]">Loading…</div>}>
      <CheckoutSuccess />
    </Suspense>
  );
}
