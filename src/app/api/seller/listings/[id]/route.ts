import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { requireRoles } from "@/lib/api-auth";
import { stockLabelFor, toSellerListing } from "@/lib/listing-map";

const patchSchema = z.object({
  name: z.string().min(1).max(120),
  categoryId: z.string().min(1).max(40),
  pricePkr: z.number().int().min(1).max(10_000_000),
  stock: z.number().int().min(0).max(1_000_000),
  status: z.enum(["active", "draft", "out"]),
  description: z.string().max(2000).optional(),
});

async function ownListing(sellerId: string, id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product || product.sellerId !== sellerId) return null;
  return product;
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const gate = await requireRoles(["seller"]);
  if (gate.error) return gate.error;
  const { id } = await ctx.params;

  const existing = await ownListing(gate.session.sub, id);
  if (!existing) return jsonError("Listing not found", 404);

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Check the listing fields", 400);

  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) return jsonError("Choose a valid category", 400);

  const store = await prisma.sellerStore.findUnique({ where: { userId: gate.session.sub } });
  const product = await prisma.product.update({
    where: { id },
    data: {
      name: parsed.data.name.trim(),
      categoryId: category.id,
      pricePkr: parsed.data.pricePkr,
      stock: parsed.data.stock,
      status: parsed.data.status,
      description: parsed.data.description?.trim() || existing.description,
      stockLabel: stockLabelFor(parsed.data.stock, parsed.data.status),
      sellerName: store?.name || existing.sellerName,
    },
    include: { category: true },
  });

  return jsonOk({ listing: toSellerListing(product) });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const gate = await requireRoles(["seller"]);
  if (gate.error) return gate.error;
  const { id } = await ctx.params;

  const existing = await ownListing(gate.session.sub, id);
  if (!existing) return jsonError("Listing not found", 404);

  const used = await prisma.orderItem.count({ where: { productId: id } });
  if (used > 0) {
    return jsonError("This listing is on an order and cannot be removed", 409);
  }

  await prisma.product.delete({ where: { id } });
  return jsonOk({ ok: true });
}
