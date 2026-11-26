import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/api-map";
import { requireApprovedSeller } from "@/lib/api-auth";
import { sellerBalances } from "@/lib/earnings";
import { commissionPctFor } from "@/lib/order-map";
import type { SellerEarnings } from "@/lib/seller";

export async function GET() {
  const gate = await requireApprovedSeller();
  if (gate.error) return gate.error;
  const sellerId = gate.session.sub;

  const [balances, payouts, commissionPct] = await Promise.all([
    sellerBalances([sellerId]),
    prisma.payout.findMany({ where: { sellerId }, orderBy: { createdAt: "desc" }, take: 100 }),
    commissionPctFor(sellerId),
  ]);
  const b = balances.get(sellerId)!;

  const earnings: SellerEarnings = {
    grossPkr: b.grossPkr,
    commissionPkr: b.commissionPkr,
    netPkr: b.netPkr,
    paidPkr: b.paidPkr,
    pendingPayoutPkr: b.pendingPayoutPkr,
    availablePkr: b.availablePkr,
    openPkr: b.openPkr,
    commissionPct,
    payouts: payouts.map((p) => ({
      id: p.id,
      amountPkr: p.amountPkr,
      periodLabel: p.periodLabel,
      status: p.status as "pending" | "paid",
      note: p.note,
      paidAt: p.paidAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
    })),
  };
  return jsonOk({ earnings });
}
