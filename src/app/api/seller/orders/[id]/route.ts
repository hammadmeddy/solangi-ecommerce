import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { requireApprovedSeller } from "@/lib/api-auth";
import { SELLER_STEPS, rankOf, rollUpStatus, toSellerOrder } from "@/lib/seller-orders";

const bodySchema = z.object({ status: z.enum(SELLER_STEPS) });

/**
 * Seller moves their lines of an order forward: placed → packed → shipped.
 * The order's own status follows once every seller has reached that step.
 */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireApprovedSeller();
  if (gate.error) return gate.error;
  const sellerId = gate.session.sub;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Status must be packed or shipped", 400);
  const next = parsed.data.status;

  const { id } = await ctx.params;
  const order = await prisma.order.findFirst({
    where: { publicId: id, items: { some: { sellerId } } },
    include: { items: true },
  });
  if (!order) return jsonError("Order not found", 404);
  if (order.status === "cancelled" || order.status === "delivered") {
    return jsonError(`This order is already ${order.status}`, 409);
  }

  const mine = order.items.filter((i) => i.sellerId === sellerId);
  if (mine.every((i) => rankOf(i.itemStatus) >= rankOf(next))) {
    return jsonError(`Already ${next}`, 409);
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.orderItem.updateMany({
      where: { orderId: order.id, sellerId, itemStatus: { in: ["placed", "packed"] } },
      data: { itemStatus: next },
    });
    const items = await tx.orderItem.findMany({ where: { orderId: order.id } });
    const rolled = rollUpStatus(items.map((i) => i.itemStatus));
    // Only move the order forward, never back.
    const status = rankOf(rolled) > rankOf(order.status) ? rolled : order.status;
    return tx.order.update({
      where: { id: order.id },
      data: { status },
      include: { items: true },
    });
  });

  return jsonOk({ order: toSellerOrder(updated, sellerId) });
}
