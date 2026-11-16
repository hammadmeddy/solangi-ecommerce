import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, productToDemo } from "@/lib/api-map";
import { requireRoles } from "@/lib/api-auth";

const patchSchema = z.object({
  name: z.string().min(2).max(160).optional(),
  categoryId: z.string().min(1).optional(),
  pricePkr: z.number().int().positive().optional(),
  stock: z.number().int().min(0).optional(),
  description: z.string().max(2000).optional(),
  mode: z.enum(["retail", "wholesale", "used", "services"]).optional(),
  status: z.enum(["active", "draft", "out"]).optional(),
  sellerName: z.string().max(80).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireRoles(["admin"]);
  if (auth.error) return auth.error;

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return jsonError("Invalid product", 400);

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return jsonError("Product not found", 404);

  const stock = parsed.data.stock ?? existing.stock;
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...parsed.data,
      stockLabel: stock > 0 ? "In stock" : "Out of stock",
      status: parsed.data.status ?? (stock === 0 ? "out" : existing.status),
    },
    include: { category: true },
  });

  return jsonOk({
    product: { ...productToDemo(product), stock: product.stock, status: product.status },
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  const auth = await requireRoles(["admin"]);
  if (auth.error) return auth.error;

  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
  } catch {
    return jsonError("This product is on an order. Set it to draft instead.", 409);
  }
  return jsonOk({ ok: true });
}
