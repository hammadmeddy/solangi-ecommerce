import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { CATEGORIES } from "@/lib/categories";
import { CategoryView } from "@/components/catalog/CategoryView";

export function generateStaticParams() {
  return CATEGORIES.filter((c) => c.href !== "services-mode").map((c) => ({
    slug: c.id,
  }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const category = CATEGORIES.find((c) => c.id === slug);
  if (!category || category.href === "services-mode") notFound();

  return <CategoryView category={category} />;
}
