import { setRequestLocale } from "next-intl/server";
import { CATALOG } from "@/lib/products";
import { MODE_CATALOG } from "@/lib/modes-catalog";
import { ProductView } from "@/components/catalog/ProductView";

export function generateStaticParams() {
  return [...CATALOG, ...MODE_CATALOG].map((p) => ({ id: p.id }));
}

/** Allow seller listing ids created at runtime (localStorage). */
export const dynamicParams = true;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <ProductView id={id} />;
}
