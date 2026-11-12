import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { getSession } from "@/lib/session";
import { isOrderStatus, ORDER_STATUSES } from "@/lib/order-status";

const patchSchema = z.object({
  status: z.string(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return jsonError("Unauthorized", 401);
  }

  try {
    const { id } = await ctx.params;
    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success || !isOrderStatus(parsed.data.status)) {
      return jsonError(
        `Status must be one of: ${ORDER_STATUSES.join(", ")}`,
        400,
      );
    }

    const existing = await prisma.order.findFirst({
      where: {
        OR: [{ publicId: id }, { id }],
      },
    });
    if (!existing) return jsonError("Order not found", 404);

    const order = await prisma.order.update({
      where: { id: existing.id },
      data: { status: parsed.data.status },
      include: { items: true },
    });

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
        customerName: order.customerName,
        phone: order.phone,
        lines: order.items.map((i) => ({
          productId: i.productId,
          name: i.name,
          qty: i.qty,
          pricePkr: i.pricePkr,
        })),
      },
    });
  } catch (err) {
    console.error(err);
    return jsonError("Could not update order", 500);
  }
}
