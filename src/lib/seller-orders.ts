import type { Order, OrderItem } from "@prisma/client";
import type { SellerOrder } from "@/lib/seller";

const RANK: Record<string, number> = { placed: 0, packed: 1, shipped: 2, delivered: 3 };

/** Seller progress steps they may set themselves. Admin handles delivered/cancelled. */
export const SELLER_STEPS = ["packed", "shipped"] as const;
export type SellerStep = (typeof SELLER_STEPS)[number];

export function rankOf(status: string) {
  return RANK[status] ?? -1;
}

/** The slowest line decides how far the order as a whole has got. */
export function rollUpStatus(itemStatuses: string[]): string {
  const live = itemStatuses.filter((s) => s !== "cancelled");
  if (live.length === 0) return "cancelled";
  return live.reduce((min, s) => (rankOf(s) < rankOf(min) ? s : min), live[0]);
}

function cityFrom(addressLabel: string) {
  // addressLabel is "Label: Name, line1, line2, City, Province" (newer orders)
  // or "Label — City" (older ones). Show the city part only.
  const dash = addressLabel.split(" — ");
  if (dash.length > 1) return dash[dash.length - 1];
  const parts = addressLabel.split(",").map((p) => p.trim()).filter(Boolean);
  return parts.length >= 2 ? parts[parts.length - 2] : "";
}

export function toSellerOrder(order: Order & { items: OrderItem[] }, sellerId: string): SellerOrder {
  const mine = order.items.filter((i) => i.sellerId === sellerId);
  const status = rollUpStatus(mine.map((i) => i.itemStatus));
  // Buyer contact details are shared once the seller has started on the order.
  const reveal = rankOf(status) >= 1 && order.status !== "cancelled";
  return {
    id: order.publicId,
    placedAt: order.createdAt.toISOString().slice(0, 10),
    buyer: order.customerName || "Solangi customer",
    city: cityFrom(order.addressLabel),
    address: reveal ? order.addressLabel : null,
    phone: reveal ? order.phone : null,
    orderStatus: order.status,
    status: order.status === "cancelled" ? "cancelled" : status,
    totalPkr: mine.reduce((sum, i) => sum + i.qty * i.pricePkr, 0),
    commissionPkr: mine.reduce((sum, i) => sum + i.commissionPkr, 0),
    summary: mine.map((i) => `${i.name} × ${i.qty}`).join(" · "),
    lines: mine.map((i) => ({
      id: i.id,
      name: i.name,
      qty: i.qty,
      pricePkr: i.pricePkr,
      itemStatus: i.itemStatus,
    })),
  };
}
