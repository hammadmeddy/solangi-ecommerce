import type { Order, OrderItem, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

type OrderWithItems = Order & { items: OrderItem[] };

/** One shape for orders across the customer, seller and admin APIs. */
export function toClientOrder(o: OrderWithItems) {
  return {
    id: o.publicId,
    placedAt: o.createdAt.toISOString().slice(0, 10),
    updatedAt: o.updatedAt.toISOString(),
    status: o.status,
    totalPkr: o.totalPkr,
    itemCount: o.itemCount,
    summary: o.summary,
    payment: o.payment,
    addressLabel: o.addressLabel,
    customerName: o.customerName,
    phone: o.phone,
    lines: o.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      name: i.name,
      qty: i.qty,
      pricePkr: i.pricePkr,
      sellerId: i.sellerId,
      itemStatus: i.itemStatus,
    })),
  };
}

export type ClientOrder = ReturnType<typeof toClientOrder>;

/** Commission % for a seller: their store override, else the site default. */
export async function commissionPctFor(
  sellerId: string | null,
  tx: Prisma.TransactionClient = prisma,
): Promise<number> {
  if (!sellerId) return 0;
  const store = await tx.sellerStore.findUnique({
    where: { userId: sellerId },
    select: { commissionPct: true },
  });
  if (store?.commissionPct != null) return store.commissionPct;
  const site = await tx.siteSetting.findUnique({
    where: { id: "solo" },
    select: { defaultCommissionPct: true },
  });
  return site?.defaultCommissionPct ?? 10;
}

/** Puts stock back for every line of an order (used on cancel). */
export async function restockOrder(orderId: string, tx: Prisma.TransactionClient) {
  const items = await tx.orderItem.findMany({ where: { orderId } });
  for (const item of items) {
    if (!item.productId) continue;
    const product = await tx.product.findUnique({ where: { id: item.productId } });
    if (!product) continue;
    const stock = product.stock + item.qty;
    await tx.product.update({
      where: { id: product.id },
      data: {
        stock,
        stockLabel: stock > 0 ? "In stock" : "Out of stock",
        ...(product.status === "out" && stock > 0 ? { status: "active" } : {}),
      },
    });
  }
}

/**
 * Changes an order's status, keeping line statuses and stock in step.
 * Cancelling restocks; un-cancelling is not allowed (stock may be gone).
 */
export async function setOrderStatus(orderId: string, status: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
    if (existing.status === "cancelled" && status !== "cancelled") {
      throw new OrderError("A cancelled order cannot be reopened");
    }
    if (status === "cancelled" && existing.status !== "cancelled") {
      await restockOrder(orderId, tx);
    }
    // Delivered/cancelled apply to every line. Earlier steps only pull lines
    // forward, so a seller who already shipped is not moved back.
    const steps = ["placed", "packed", "shipped"];
    const lower =
      status === "cancelled" || status === "delivered"
        ? undefined
        : steps.slice(0, Math.max(0, steps.indexOf(status)));
    await tx.orderItem.updateMany({
      where: { orderId, ...(lower ? { itemStatus: { in: lower } } : {}) },
      data: { itemStatus: status },
    });
    return tx.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });
  });
}

export class OrderError extends Error {}
