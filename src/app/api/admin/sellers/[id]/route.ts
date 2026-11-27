import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { requireRoles } from "@/lib/api-auth";
import { slugify } from "@/lib/seller-store";
import { notifyStoreDecision, type EmailResult, type StoreDecision } from "@/lib/decision-mail";

// One endpoint for every admin action on a seller store. `id` is the store id.
const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({ action: z.literal("reject"), reason: z.string().min(3).max(300) }),
  z.object({ action: z.literal("suspend"), reason: z.string().max(300).optional() }),
  z.object({ action: z.literal("reinstate") }),
  z.object({ action: z.literal("verify"), verified: z.boolean() }),
  z.object({
    action: z.literal("commission"),
    /** null = use the site default */
    commissionPct: z.number().int().min(0).max(90).nullable(),
  }),
  z.object({
    action: z.literal("edit"),
    name: z.string().min(2).max(80),
    slug: z.string().min(2).max(60),
    city: z.string().min(2).max(60),
    phone: z.string().min(6).max(20),
    bio: z.string().max(600),
  }),
]);

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireRoles(["admin"]);
  if (auth.error) return auth.error;

  const { id } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid seller action", 400);
  const body = parsed.data;

  const store = await prisma.sellerStore.findUnique({ where: { id }, include: { user: true } });
  if (!store) return jsonError("Store not found", 404);
  if (store.user.role === "admin") return jsonError("Admin accounts cannot be sellers", 400);

  const now = new Date();
  let decision: StoreDecision | null = null;
  let reason: string | null = null;

  switch (body.action) {
    case "approve":
    case "reinstate": {
      await prisma.$transaction([
        prisma.sellerStore.update({
          where: { id },
          data: { status: "approved", reviewedAt: now, rejectionReason: null },
        }),
        prisma.user.update({ where: { id: store.userId }, data: { role: "seller" } }),
      ]);
      if (store.status !== "approved") {
        decision = body.action === "reinstate" || store.status === "suspended" ? "reinstated" : "approved";
      }
      break;
    }
    case "reject":
    case "suspend": {
      const status = body.action === "reject" ? "rejected" : "suspended";
      await prisma.$transaction([
        prisma.sellerStore.update({
          where: { id },
          data: { status, reviewedAt: now, rejectionReason: body.reason ?? null },
        }),
        // Back to customer: they keep shopping, but the seller panel locks.
        prisma.user.update({ where: { id: store.userId }, data: { role: "customer" } }),
        prisma.product.updateMany({
          where: { sellerId: store.userId, status: { in: ["active", "pending"] } },
          data: { status: "draft", reviewNote: `Store ${status} by admin` },
        }),
      ]);
      if (store.status !== status) {
        decision = status;
        reason = body.reason ?? null;
      }
      break;
    }
    case "verify":
      await prisma.sellerStore.update({ where: { id }, data: { verified: body.verified } });
      break;
    case "commission":
      await prisma.sellerStore.update({
        where: { id },
        data: { commissionPct: body.commissionPct },
      });
      break;
    case "edit": {
      const slug = slugify(body.slug) || slugify(body.name);
      const clash = await prisma.sellerStore.findFirst({ where: { slug, NOT: { id } } });
      if (clash) return jsonError("That store link is taken", 409);
      await prisma.sellerStore.update({
        where: { id },
        data: { name: body.name.trim(), slug, city: body.city.trim(), phone: body.phone.trim(), bio: body.bio.trim() },
      });
      // Keep the name shown on listings in step with the store name.
      await prisma.product.updateMany({
        where: { sellerId: store.userId },
        data: { sellerName: body.name.trim() },
      });
      break;
    }
  }

  const updated = await prisma.sellerStore.findUniqueOrThrow({ where: { id } });
  const email: EmailResult | null = decision
    ? await notifyStoreDecision(
        { name: store.user.name, email: store.user.email },
        updated.name,
        decision,
        reason,
      )
    : null;
  return jsonOk({ store: updated, email });
}
