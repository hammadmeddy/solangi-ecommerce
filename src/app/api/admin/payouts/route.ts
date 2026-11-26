import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { requireRoles } from "@/lib/api-auth";
import { sellerBalances } from "@/lib/earnings";

/** Balances for every seller plus the payout ledger. */
export async function GET() {
  const auth = await requireRoles(["admin"]);
  if (auth.error) return auth.error;

  const [stores, payouts] = await Promise.all([
    prisma.sellerStore.findMany({
      where: { status: { in: ["approved", "suspended"] } },
      select: { userId: true, name: true, phone: true },
      orderBy: { name: "asc" },
    }),
    prisma.payout.findMany({
      orderBy: { createdAt: "desc" },
      take: 300,
      include: { seller: { select: { name: true, store: { select: { name: true } } } } },
    }),
  ]);
  const balances = await sellerBalances(stores.map((s) => s.userId));

  return jsonOk({
    sellers: stores.map((s) => ({ ...s, balance: balances.get(s.userId) })),
    payouts: payouts.map((p) => ({
      id: p.id,
      sellerId: p.sellerId,
      storeName: p.seller.store?.name ?? p.seller.name,
      amountPkr: p.amountPkr,
      periodLabel: p.periodLabel,
      status: p.status,
      note: p.note,
      paidAt: p.paidAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
    })),
  });
}

const createSchema = z.object({
  sellerId: z.string().min(1),
  amountPkr: z.number().int().positive(),
  periodLabel: z.string().max(60).optional(),
  note: z.string().max(300).optional(),
});

/** Records a payout (pending). It cannot exceed the seller's available balance. */
export async function POST(req: Request) {
  const auth = await requireRoles(["admin"]);
  if (auth.error) return auth.error;

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Check the payout amount", 400);

  const balance = (await sellerBalances([parsed.data.sellerId])).get(parsed.data.sellerId);
  if (!balance || parsed.data.amountPkr > balance.availablePkr) {
    return jsonError("Amount is more than the seller's available balance", 409);
  }

  const payout = await prisma.payout.create({
    data: {
      sellerId: parsed.data.sellerId,
      amountPkr: parsed.data.amountPkr,
      periodLabel: parsed.data.periodLabel?.trim() ?? "",
      note: parsed.data.note?.trim() ?? "",
    },
  });
  return jsonOk({ payout }, { status: 201 });
}
