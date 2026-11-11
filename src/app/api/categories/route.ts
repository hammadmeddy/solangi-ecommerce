import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/api-map";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return jsonOk({
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      photoLabel: c.photoLabel,
      href: c.hrefKind === "services-mode" ? "services-mode" : "category",
      imageUrl: c.imageUrl,
    })),
  });
}
