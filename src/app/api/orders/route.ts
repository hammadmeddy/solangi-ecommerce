import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { getActiveSession } from "@/lib/api-auth";
import { commissionPctFor, OrderError, toClientOrder } from "@/lib/order-map";

// Prices, totals and sellers are worked out here from the database. The
// client only says which products, how many, and where to deliver.
const placeSchema = z.object({
  addressLabel: z.string().min(3).max(240),
  customerName: z.string().max(80).optional(),
  phone: z.string().max(20).optional(),
  payment: z.literal("COD").optional(),
  lines: z
    .array(
      z.object({
        productId: z.string().min(1),
        qty: z.number().int().positive().max(999),
      }),
    )
    .min(1)
    .max(50),
});

export async function GET() {
  const session = await getActiveSession();
  if (!session) return jsonError("Unauthorized", 401);

  const orders = await prisma.order.findMany({
    where: session.role === "admin" ? {} : { userId: session.sub },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return jsonOk({ orders: orders.map(toClientOrder) });
}

export async function POST(req: Request) {
  const session = await getActiveSession();
  const parsed = placeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid order payload", 400);

  // Merge repeated products into one line.
  const qtyById = new Map<string, number>();
  for (const line of parsed.data.lines) {
    qtyById.set(line.productId, (qtyById.get(line.productId) ?? 0) + line.qty);
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: [...qtyById.keys()] } },
      });
      const byId = new Map(products.map((p) => [p.id, p]));

      const items: {
        productId: string;
        name: string;
        qty: number;
        pricePkr: number;
        sellerId: string | null;
        commissionPkr: number;
      }[] = [];

      for (const [productId, qty] of qtyById) {
        const product = byId.get(productId);
        if (!product || product.status !== "active") {
          throw new OrderError(`${product?.name ?? "A product"} is no longer available`);
        }
        if (product.stock < qty) {
          throw new OrderError(
            product.stock > 0
              ? `Only ${product.stock} left of ${product.name}`
              : `${product.name} is out of stock`,
          );
        }
        // Conditional decrement so two buyers cannot take the last unit.
        const updated = await tx.product.updateMany({
          where: { id: productId, stock: { gte: qty } },
          data: { stock: { decrement: qty } },
        });
        if (updated.count !== 1) throw new OrderError(`${product.name} just sold out`);
        const left = product.stock - qty;
        if (left === 0) {
          await tx.product.update({
            where: { id: productId },
            data: { stockLabel: "Out of stock", status: "out" },
          });
        }

        const pct = await commissionPctFor(product.sellerId, tx);
        const lineTotal = product.pricePkr * qty;
        items.push({
          productId,
          name: product.name,
          qty,
          pricePkr: product.pricePkr,
          sellerId: product.sellerId,
          commissionPkr: Math.round((lineTotal * pct) / 100),
        });
      }

      const totalPkr = items.reduce((sum, i) => sum + i.pricePkr * i.qty, 0);
      const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
      const summary = items
        .map((i) => `${i.name} × ${i.qty}`)
        .join(" · ")
        .slice(0, 500);

      let publicId = "";
      for (let attempt = 0; attempt < 5 && !publicId; attempt++) {
        const candidate = `SE-${100000 + Math.floor(Math.random() * 900000)}`;
        const clash = await tx.order.findUnique({ where: { publicId: candidate } });
        if (!clash) publicId = candidate;
      }
      if (!publicId) throw new Error("Could not allocate order number");

      return tx.order.create({
        data: {
          publicId,
          userId: session?.sub,
          totalPkr,
          itemCount,
          summary,
          payment: "COD",
          addressLabel: parsed.data.addressLabel,
          customerName: parsed.data.customerName || session?.name,
          phone: parsed.data.phone || session?.phone,
          items: { create: items },
        },
        include: { items: true },
      });
    });

    if (session?.sub) {
      await prisma.cartItem.deleteMany({ where: { userId: session.sub } });
    }

    return jsonOk({ order: toClientOrder(order) });
  } catch (err) {
    if (err instanceof OrderError) return jsonError(err.message, 409);
    console.error(err);
    return jsonError("Could not place order", 500);
  }
}
