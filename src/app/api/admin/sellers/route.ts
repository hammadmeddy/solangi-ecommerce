import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/api-map";
import { requireRoles } from "@/lib/api-auth";
import { sellerBalances } from "@/lib/earnings";

const STATUSES = ["pending", "approved", "rejected", "suspended"];

export async function GET(req: Request) {
  const auth = await requireRoles(["admin"]);
  if (auth.error) return auth.error;

  const status = new URL(req.url).searchParams.get("status") ?? "";
  const stores = await prisma.sellerStore.findMany({
    where: STATUSES.includes(status) ? { status } : {},
    orderBy: [{ appliedAt: "desc" }],
    take: 300,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          role: true,
          status: true,
          listings: { select: { status: true } },
        },
      },
    },
  });

  const balances = await sellerBalances(stores.map((s) => s.userId));
  const site = await prisma.siteSetting.findUnique({ where: { id: "solo" } });

  return jsonOk({
    defaultCommissionPct: site?.defaultCommissionPct ?? 10,
    sellers: stores.map(({ user, ...store }) => {
      const listingCounts: Record<string, number> = {};
      for (const l of user.listings) listingCounts[l.status] = (listingCounts[l.status] ?? 0) + 1;
      return {
        ...store,
        appliedAt: store.appliedAt.toISOString(),
        reviewedAt: store.reviewedAt?.toISOString() ?? null,
        user: { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role, status: user.status },
        listingCounts,
        balance: balances.get(store.userId) ?? null,
      };
    }),
  });
}
