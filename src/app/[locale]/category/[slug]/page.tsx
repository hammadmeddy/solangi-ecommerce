import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { CATEGORIES } from "@/lib/categories";
import { CategoryView } from "@/components/catalog/CategoryView";
import { prisma } from "@/lib/db";
import { productToDemo } from "@/lib/api-map";
import { CATALOG } from "@/lib/products";
import { MODE_CATALOG } from "@/lib/modes-catalog";

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

  let initialProducts = [...CATALOG, ...MODE_CATALOG].filter(
    (p) => p.categoryId === category.id && (p.mode ?? "retail") === "retail",
  );

  try {
    const rows = await prisma.product.findMany({
      where: {
        status: "active",
        stock: { gt: 0 },
        categoryId: category.id,
        mode: "retail",
      },
      include: { category: true },
      orderBy: { name: "asc" },
      take: 80,
    });
    if (rows.length > 0) {
      initialProducts = rows.map(productToDemo);
    }
  } catch {
    /* keep static seed if DB unavailable at build/runtime */
  }

  return (
    <CategoryView category={category} initialProducts={initialProducts} />
  );
}
