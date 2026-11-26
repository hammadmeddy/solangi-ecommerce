import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { getActiveSession } from "@/lib/api-auth";
import { isOrderStatus, ORDER_STATUSES } from "@/lib/order-status";
import { OrderError, setOrderStatus, toClientOrder } from "@/lib/order-map";

const patchSchema = z.object({ status: z.string() });

type Ctx = { params: Promise<{ id: string }> };

async function findOrder(id: string) {
  return prisma.order.findFirst({
    where: { OR: [{ publicId: id }, { id }] },
    include: { items: true },
  });
}

export async function GET(_req: Request, ctx: Ctx) {
  const session = await getActiveSession();
  if (!session) return jsonError("Unauthorized", 401);
  const order = await findOrder((await ctx.params).id);
  if (!order || (session.role !== "admin" && order.userId !== session.sub)) {
    return jsonError("Order not found", 404);
  }
  return jsonOk({ order: toClientOrder(order) });
}

/** Admin: any status. Customer: may cancel their own order while it is still "placed". */
export async function PATCH(req: Request, ctx: Ctx) {
  const session = await getActiveSession();
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !isOrderStatus(parsed.data.status)) {
    return jsonError(`Status must be one of: ${ORDER_STATUSES.join(", ")}`, 400);
  }
  const status = parsed.data.status;

  const existing = await findOrder((await ctx.params).id);
  if (!existing) return jsonError("Order not found", 404);

  if (session.role !== "admin") {
    if (existing.userId !== session.sub) return jsonError("Order not found", 404);
    if (status !== "cancelled") return jsonError("You can only cancel an order", 403);
    if (existing.status !== "placed") {
      return jsonError("This order is already being prepared and can't be cancelled", 409);
    }
  }

  try {
    const order = await setOrderStatus(existing.id, status);
    return jsonOk({ order: toClientOrder(order) });
  } catch (err) {
    if (err instanceof OrderError) return jsonError(err.message, 409);
    console.error(err);
    return jsonError("Could not update order", 500);
  }
}
