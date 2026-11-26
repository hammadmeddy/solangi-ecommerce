import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { requireApprovedSeller } from "@/lib/api-auth";
import { nextListingStatus, stockLabelFor, toSellerListing } from "@/lib/listing-map";
import { deleteManagedUpload, saveImageUpload } from "@/lib/uploads";
import { listingSchema } from "@/lib/listing-schema";

async function ownListing(sellerId: string, id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product || product.sellerId !== sellerId) return null;
  return product;
}

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const gate = await requireApprovedSeller();
  if (gate.error) return gate.error;
  const { id } = await ctx.params;

  const existing = await ownListing(gate.session.sub, id);
  if (!existing) return jsonError("Listing not found", 404);

  const parsed = listingSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Check the listing fields", 400);
  const input = parsed.data;

  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category) return jsonError("Choose a valid category", 400);

  let imageUrl = existing.imageUrl;
  if (input.imageDataUrl) {
    try {
      imageUrl = await saveImageUpload("product", id, input.imageDataUrl);
    } catch (err) {
      return jsonError(err instanceof Error ? err.message : "Image upload failed", 400);
    }
  }

  const status = nextListingStatus(existing, { ...input, imageUrl });
  const product = await prisma.product.update({
    where: { id },
    data: {
      name: input.name.trim(),
      categoryId: category.id,
      pricePkr: input.pricePkr,
      stock: input.stock,
      status,
      description: input.description?.trim() || existing.description,
      stockLabel: stockLabelFor(input.stock, status),
      imageUrl,
      ...(status === "pending" ? { reviewNote: null } : {}),
    },
    include: { category: true },
  });

  if (imageUrl !== existing.imageUrl) await deleteManagedUpload(existing.imageUrl);

  return jsonOk({ listing: toSellerListing(product) });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const gate = await requireApprovedSeller();
  if (gate.error) return gate.error;
  const { id } = await ctx.params;

  const existing = await ownListing(gate.session.sub, id);
  if (!existing) return jsonError("Listing not found", 404);

  const used = await prisma.orderItem.count({ where: { productId: id } });
  if (used > 0) {
    return jsonError("This listing is on an order. Save it as a draft to hide it instead.", 409);
  }

  await prisma.product.delete({ where: { id } });
  await deleteManagedUpload(existing.imageUrl);
  return jsonOk({ ok: true });
}
