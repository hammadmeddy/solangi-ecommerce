import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { getSession } from "@/lib/session";

const placeSchema = z.object({
  addressLabel: z.string().min(3).max(240),
  summary: z.string().min(1).max(500),
  totalPkr: z.number().int().positive(),
  itemCount: z.number().int().positive(),
  customerName: z.string().optional(),
  phone: z.string().optional(),
  lines: z
    .array(
      z.object({
        productId: z.string().optional(),
        name: z.string(),
        qty: z.number().int().positive(),
        pricePkr: z.number().int().nonnegative(),
      }),
    )
    .min(1),
});

export async function GET() {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const where =
    session.role === "admin"
      ? {}
      : { userId: session.sub };

  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return jsonOk({
    orders: orders.map((o) => ({
      id: o.publicId,
      placedAt: o.createdAt.toISOString().slice(0, 10),
      status: o.status,
      totalPkr: o.totalPkr,
      itemCount: o.itemCount,
      summary: o.summary,
      payment: o.payment,
      addressLabel: o.addressLabel,
      customerName: o.customerName,
      phone: o.phone,
      lines: o.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        qty: i.qty,
        pricePkr: i.pricePkr,
      })),
    })),
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  try {
    const json = await req.json();
    const parsed = placeSchema.safeParse(json);
    if (!parsed.success) return jsonError("Invalid order payload", 400);

    const publicId = `SE-${10000 + Math.floor(Math.random() * 80000)}`;
    const order = await prisma.order.create({
      data: {
        publicId,
        userId: session?.sub,
        totalPkr: parsed.data.totalPkr,
        itemCount: parsed.data.itemCount,
        summary: parsed.data.summary,
        payment: "COD",
        addressLabel: parsed.data.addressLabel,
        customerName: parsed.data.customerName || session?.name,
        phone: parsed.data.phone || session?.phone,
        items: {
          create: parsed.data.lines.map((line) => ({
            productId: line.productId || null,
            name: line.name,
            qty: line.qty,
            pricePkr: line.pricePkr,
          })),
        },
      },
      include: { items: true },
    });

    if (session?.sub) {
      await prisma.cartItem.deleteMany({ where: { userId: session.sub } });
    }

    return jsonOk({
      order: {
        id: order.publicId,
        placedAt: order.createdAt.toISOString().slice(0, 10),
        status: order.status,
        totalPkr: order.totalPkr,
        itemCount: order.itemCount,
        summary: order.summary,
        payment: order.payment,
        addressLabel: order.addressLabel,
      },
    });
  } catch (err) {
    console.error(err);
    return jsonError("Could not place order", 500);
  }
}
