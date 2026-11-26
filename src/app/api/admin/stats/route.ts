import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/api-map";
import { requireRoles } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireRoles(["admin"]);
  if (auth.error) return auth.error;

  const [
    users,
    suspendedUsers,
    storesByStatus,
    productsByStatus,
    ordersByStatus,
    delivered,
    pendingPayouts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "suspended" } }),
    prisma.sellerStore.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.product.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true }, _sum: { totalPkr: true } }),
    prisma.orderItem.aggregate({
      where: { order: { status: "delivered" } },
      _sum: { commissionPkr: true },
    }),
    prisma.payout.aggregate({ where: { status: "pending" }, _sum: { amountPkr: true } }),
  ]);

  const count = <T extends { _count: { _all: number } }>(rows: T[], key: keyof T) =>
    Object.fromEntries(rows.map((r) => [String(r[key]), r._count._all]));

  const orders = count(ordersByStatus, "status");
  const gmvPkr = ordersByStatus
    .filter((r) => r.status !== "cancelled")
    .reduce((sum, r) => sum + (r._sum.totalPkr ?? 0), 0);
  const deliveredPkr = ordersByStatus.find((r) => r.status === "delivered")?._sum.totalPkr ?? 0;

  return jsonOk({
    stats: {
      users,
      suspendedUsers,
      stores: count(storesByStatus, "status"),
      products: count(productsByStatus, "status"),
      orders,
      gmvPkr,
      deliveredPkr,
      commissionPkr: delivered._sum.commissionPkr ?? 0,
      pendingPayoutPkr: pendingPayouts._sum.amountPkr ?? 0,
    },
  });
}
