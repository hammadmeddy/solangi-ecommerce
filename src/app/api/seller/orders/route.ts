import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/api-map";
import { requireApprovedSeller } from "@/lib/api-auth";
import { toSellerOrder } from "@/lib/seller-orders";

/** Orders that contain at least one of this seller's products (their lines only). */
export async function GET() {
  const gate = await requireApprovedSeller();
  if (gate.error) return gate.error;

  const orders = await prisma.order.findMany({
    where: { items: { some: { sellerId: gate.session.sub } } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return jsonOk({ orders: orders.map((o) => toSellerOrder(o, gate.session.sub)) });
}
