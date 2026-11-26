import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { requireRoles } from "@/lib/api-auth";

const bodySchema = z.object({ status: z.literal("paid"), note: z.string().max(300).optional() });
type Params = { params: Promise<{ id: string }> };

/** Marks a recorded payout as paid (the transfer itself happens outside Solangi). */
export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireRoles(["admin"]);
  if (auth.error) return auth.error;
  const { id } = await params;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid payout update", 400);

  const existing = await prisma.payout.findUnique({ where: { id } });
  if (!existing) return jsonError("Payout not found", 404);
  if (existing.status === "paid") return jsonError("Already marked paid", 409);

  const payout = await prisma.payout.update({
    where: { id },
    data: {
      status: "paid",
      paidAt: new Date(),
      ...(parsed.data.note ? { note: parsed.data.note.trim() } : {}),
    },
  });
  return jsonOk({ payout });
}

/** Deletes a payout that was recorded by mistake (only while still pending). */
export async function DELETE(_req: Request, { params }: Params) {
  const auth = await requireRoles(["admin"]);
  if (auth.error) return auth.error;
  const { id } = await params;
  const existing = await prisma.payout.findUnique({ where: { id } });
  if (!existing) return jsonError("Payout not found", 404);
  if (existing.status === "paid") return jsonError("Paid payouts stay on the ledger", 409);
  await prisma.payout.delete({ where: { id } });
  return jsonOk({ ok: true });
}
