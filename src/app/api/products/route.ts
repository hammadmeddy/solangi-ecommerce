import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonOk, productToDemo } from "@/lib/api-map";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");
  const categoryId = searchParams.get("category");
  const q = searchParams.get("q")?.trim();
  const sellerOnly = searchParams.get("sellerOnly") === "1";

  const where: Prisma.ProductWhereInput = {
    status: "active",
  };

  if (mode && mode !== "all") {
    where.mode = mode;
  }
  if (categoryId && categoryId !== "all") {
    where.categoryId = categoryId;
  }
  if (sellerOnly) {
    where.sellerId = { not: null };
  }
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { sellerName: { contains: q } },
      { category: { name: { contains: q } } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: [{ mode: "asc" }, { name: "asc" }],
    take: 200,
  });

  return jsonOk({ products: products.map(productToDemo) });
}
