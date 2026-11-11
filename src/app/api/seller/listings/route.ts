import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { requireRoles } from "@/lib/api-auth";
import { toSellerListing, stockLabelFor } from "@/lib/listing-map";

const listingSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/).optional(),
  name: z.string().min(1).max(120),
  categoryId: z.string().min(1).max(40),
  pricePkr: z.number().int().min(1).max(10_000_000),
  stock: z.number().int().min(0).max(1_000_000),
  status: z.enum(["active", "draft", "out"]),
  description: z.string().max(2000).optional(),
});

export async function GET() {
  const gate = await requireRoles(["seller"]);
  if (gate.error) return gate.error;

  const products = await prisma.product.findMany({
    where: { sellerId: gate.session.sub },
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });

  return jsonOk({ listings: products.map(toSellerListing) });
}

export async function POST(req: Request) {
  const gate = await requireRoles(["seller"]);
  if (gate.error) return gate.error;

  const parsed = listingSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Check the listing fields", 400);

  const input = parsed.data;
  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category) return jsonError("Choose a valid category", 400);

  const id = input.id ?? `listing-${Date.now().toString(36)}`;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (existing) {
    if (existing.sellerId !== gate.session.sub) {
      return jsonError("That listing id is already used", 409);
    }
    return jsonError("Listing already exists", 409);
  }

  const store = await prisma.sellerStore.findUnique({ where: { userId: gate.session.sub } });
  const product = await prisma.product.create({
    data: {
      id,
      name: input.name.trim(),
      categoryId: category.id,
      pricePkr: input.pricePkr,
      description: input.description?.trim() || `${input.name.trim()} from ${store?.name ?? "Solangi"}.`,
      sellerName: store?.name || gate.session.name,
      stock: input.stock,
      stockLabel: stockLabelFor(input.stock, input.status),
      status: input.status,
      mode: "retail",
      sellerId: gate.session.sub,
    },
    include: { category: true },
  });

  return jsonOk({ listing: toSellerListing(product) }, { status: 201 });
}
