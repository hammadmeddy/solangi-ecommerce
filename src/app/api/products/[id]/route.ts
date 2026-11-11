import { prisma } from "@/lib/db";
import { jsonError, jsonOk, productToDemo } from "@/lib/api-map";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product || product.status !== "active") {
    return jsonError("Product not found", 404);
  }
  return jsonOk({ product: productToDemo(product) });
}
