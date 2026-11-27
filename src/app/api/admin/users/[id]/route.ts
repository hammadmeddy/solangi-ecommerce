import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { requireRoles } from "@/lib/api-auth";
import { toClientOrder } from "@/lib/order-map";
import { ensureStoreFor } from "@/lib/seller-store";
import { notifyStoreDecision, type EmailResult } from "@/lib/decision-mail";

const bodySchema = z
  .object({
    role: z.enum(["customer", "seller", "admin"]).optional(),
    status: z.enum(["active", "suspended"]).optional(),
  })
  .refine((v) => v.role || v.status, "Nothing to change");

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const auth = await requireRoles(["admin"]);
  if (auth.error) return auth.error;
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      store: true,
      addresses: true,
      orders: { include: { items: true }, orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!user) return jsonError("User not found", 404);

  return jsonOk({
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      status: user.status,
      city: user.city,
      createdAt: user.createdAt.toISOString(),
      store: user.store,
      addresses: user.addresses,
      orders: user.orders.map(toClientOrder),
    },
  });
}

export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireRoles(["admin"]);
  if (auth.error) return auth.error;

  const { id } = await params;
  if (id === auth.session.sub) return jsonError("You cannot change your own account here", 400);

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid change", 400);
  const { role, status } = parsed.data;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return jsonError("User not found", 404);

  const losingAdmin =
    target.role === "admin" && ((role && role !== "admin") || status === "suspended");
  if (losingAdmin) {
    const admins = await prisma.user.count({ where: { role: "admin", status: "active" } });
    if (admins <= 1) return jsonError("Keep at least one active admin", 409);
  }

  const user = await prisma.user.update({
    where: { id },
    data: { ...(role ? { role } : {}), ...(status ? { status } : {}) },
    select: { id: true, name: true, phone: true, email: true, role: true, status: true },
  });

  // Making someone a seller here counts as approving their store.
  let email: EmailResult | null = null;
  if (role === "seller" && target.role !== "seller") {
    const before = await prisma.sellerStore.findUnique({ where: { userId: id }, select: { status: true } });
    const store = await ensureStoreFor(user, "approved");
    if (before?.status !== "approved") {
      email = await notifyStoreDecision(user, store.name, before?.status === "suspended" ? "reinstated" : "approved");
    }
  }
  // A seller taken off the seller role, or suspended, should not stay live.
  if ((role && role !== "seller" && target.role === "seller") || status === "suspended") {
    await prisma.product.updateMany({
      where: { sellerId: id, status: "active" },
      data: { status: "draft", reviewNote: "Hidden by admin: account changed" },
    });
  }

  return jsonOk({ user, email });
}
