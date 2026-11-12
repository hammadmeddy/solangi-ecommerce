import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { getSession } from "@/lib/session";

const lineSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  categoryId: z.string().min(1),
  pricePkr: z.number().int().nonnegative(),
  qty: z.number().int().positive(),
});

const putSchema = z.object({
  lines: z.array(lineSchema),
});

function mapLines(
  items: {
    productId: string;
    name: string;
    category: string;
    categoryId: string;
    pricePkr: number;
    qty: number;
  }[],
) {
  return items.map((i) => ({
    productId: i.productId,
    name: i.name,
    category: i.category,
    categoryId: i.categoryId,
    pricePkr: i.pricePkr,
    qty: i.qty,
  }));
}

export async function GET() {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const items = await prisma.cartItem.findMany({
    where: { userId: session.sub },
    orderBy: { updatedAt: "desc" },
  });

  return jsonOk({ lines: mapLines(items) });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const json = await req.json();
    const parsed = putSchema.safeParse(json);
    if (!parsed.success) return jsonError("Invalid cart payload", 400);

    const productIds = [...new Set(parsed.data.lines.map((l) => l.productId))];
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true },
    });
    const allowed = new Set(existingProducts.map((p) => p.id));
    const lines = parsed.data.lines.filter((l) => allowed.has(l.productId));

    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { userId: session.sub } });
      if (lines.length === 0) return;
      await tx.cartItem.createMany({
        data: lines.map((l) => ({
          userId: session.sub,
          productId: l.productId,
          name: l.name,
          category: l.category,
          categoryId: l.categoryId,
          pricePkr: l.pricePkr,
          qty: l.qty,
        })),
      });
    });

    return jsonOk({ lines });
  } catch (err) {
    console.error(err);
    return jsonError("Could not save cart", 500);
  }
}

export async function DELETE() {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);
  await prisma.cartItem.deleteMany({ where: { userId: session.sub } });
  return jsonOk({ lines: [] });
}
