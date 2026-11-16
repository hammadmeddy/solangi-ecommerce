import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { requireRoles } from "@/lib/api-auth";

const bodySchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1).max(160),
  category: z.string().max(80).optional(),
  pricePkr: z.number().int().nonnegative(),
});

export async function GET() {
  const auth = await requireRoles(["customer", "seller", "admin"]);
  if (auth.error) return auth.error;

  const rows = await prisma.wishlistItem.findMany({
    where: { userId: auth.session.sub },
    orderBy: { createdAt: "desc" },
  });

  return jsonOk({
    wishlist: rows.map((row) => ({
      productId: row.productId,
      name: row.name,
      category: row.category,
      pricePkr: row.pricePkr,
      addedAt: row.createdAt.toISOString().slice(0, 10),
    })),
  });
}

export async function POST(req: Request) {
  const auth = await requireRoles(["customer", "seller", "admin"]);
  if (auth.error) return auth.error;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return jsonError("Invalid wishlist item", 400);

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId: auth.session.sub,
        productId: parsed.data.productId,
      },
    },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return jsonOk({ saved: false });
  }

  await prisma.wishlistItem.create({
    data: {
      userId: auth.session.sub,
      productId: parsed.data.productId,
      name: parsed.data.name,
      category: parsed.data.category || "",
      pricePkr: parsed.data.pricePkr,
    },
  });
  return jsonOk({ saved: true });
}

export async function DELETE(req: Request) {
  const auth = await requireRoles(["customer", "seller", "admin"]);
  if (auth.error) return auth.error;

  const productId = new URL(req.url).searchParams.get("productId");
  if (!productId) return jsonError("Missing product", 400);

  await prisma.wishlistItem.deleteMany({
    where: { userId: auth.session.sub, productId },
  });
  return jsonOk({ ok: true });
}
