import { prisma } from "@/lib/db";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

/** Creates a store for a user if they have none; optionally sets its status. */
export async function ensureStoreFor(
  user: { id: string; name: string; phone: string },
  status?: "pending" | "approved",
) {
  const existing = await prisma.sellerStore.findUnique({ where: { userId: user.id } });
  if (existing) {
    if (status && existing.status !== status) {
      return prisma.sellerStore.update({
        where: { id: existing.id },
        data: { status, reviewedAt: new Date(), rejectionReason: null },
      });
    }
    return existing;
  }
  return prisma.sellerStore.create({
    data: {
      userId: user.id,
      name: `${user.name}'s Store`,
      slug: `${slugify(user.name) || "store"}-${user.id.slice(-4)}`,
      city: "Pakistan",
      phone: user.phone,
      bio: "",
      status: status ?? "pending",
      ...(status === "approved" ? { reviewedAt: new Date() } : {}),
    },
  });
}
