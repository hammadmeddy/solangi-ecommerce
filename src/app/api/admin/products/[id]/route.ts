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
  status: z.enum(["active", "draft", "out", "pending", "rejected"]).optional(),
  sellerName: z.string().max(80).optional(),
  /** Shown to the seller, e.g. why a listing was rejected */
  reviewNote: z.string().max(300).nullable().optional(),
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
  let status = parsed.data.status ?? existing.status;
  if (status === "active" && stock === 0) status = "out";
  if (status === "out" && stock > 0 && parsed.data.status === undefined) status = "active";
  if (parsed.data.status === "rejected" && !parsed.data.reviewNote) {
    return jsonError("Give the seller a reason for rejecting", 400);
  }
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...parsed.data,
      stockLabel: stock > 0 ? "In stock" : "Out of stock",
      status,
      ...(status === "active" && parsed.data.reviewNote === undefined ? { reviewNote: null } : {}),
    },
    include: { category: true },
  });

  return jsonOk({
    product: {
      ...productToDemo(product),
      stock: product.stock,
      status: product.status,
      reviewNote: product.reviewNote,
      sellerId: product.sellerId,
    },
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
