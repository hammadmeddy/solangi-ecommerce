import { prisma } from "@/lib/db";

export type SellerBalance = {
  sellerId: string;
  /** Revenue from delivered lines */
  grossPkr: number;
  commissionPkr: number;
  netPkr: number;
  /** Payouts already marked paid */
  paidPkr: number;
  /** Payouts recorded but not yet paid */
  pendingPayoutPkr: number;
  /** net - paid - pending: what can still be paid out */
  availablePkr: number;
  /** Lines not yet delivered or cancelled (money not earned yet) */
  openPkr: number;
};

/**
 * Earnings come from order lines whose order is delivered. Open (not yet
 * delivered) revenue is shown separately and cannot be paid out.
 */
export async function sellerBalances(sellerIds?: string[]): Promise<Map<string, SellerBalance>> {
  const sellerFilter = sellerIds ? { in: sellerIds } : { not: null };
  const [delivered, open, payouts] = await Promise.all([
    prisma.orderItem.findMany({
      where: { sellerId: sellerFilter, order: { status: "delivered" } },
      select: { sellerId: true, qty: true, pricePkr: true, commissionPkr: true },
    }),
    prisma.orderItem.findMany({
      where: {
        sellerId: sellerFilter,
        order: { status: { in: ["placed", "packed", "shipped"] } },
      },
      select: { sellerId: true, qty: true, pricePkr: true },
    }),
    prisma.payout.findMany({
      where: sellerIds ? { sellerId: { in: sellerIds } } : {},
      select: { sellerId: true, amountPkr: true, status: true },
    }),
  ]);

  const map = new Map<string, SellerBalance>();
  const get = (id: string) => {
    let row = map.get(id);
    if (!row) {
      row = {
        sellerId: id,
        grossPkr: 0,
        commissionPkr: 0,
        netPkr: 0,
        paidPkr: 0,
        pendingPayoutPkr: 0,
        availablePkr: 0,
        openPkr: 0,
      };
      map.set(id, row);
    }
    return row;
  };

  for (const id of sellerIds ?? []) get(id);
  for (const line of delivered) {
    if (!line.sellerId) continue;
    const row = get(line.sellerId);
    row.grossPkr += line.qty * line.pricePkr;
    row.commissionPkr += line.commissionPkr;
  }
  for (const line of open) {
    if (!line.sellerId) continue;
    get(line.sellerId).openPkr += line.qty * line.pricePkr;
  }
  for (const p of payouts) {
    const row = get(p.sellerId);
    if (p.status === "paid") row.paidPkr += p.amountPkr;
    else row.pendingPayoutPkr += p.amountPkr;
  }
  for (const row of map.values()) {
    row.netPkr = row.grossPkr - row.commissionPkr;
    row.availablePkr = row.netPkr - row.paidPkr - row.pendingPayoutPkr;
  }
  return map;
}
