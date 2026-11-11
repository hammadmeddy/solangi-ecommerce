import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { getSession, setSessionCookie, signSession } from "@/lib/session";
import type { AuthRole } from "@/lib/auth";

/** Promote the signed-in customer to seller and refresh the session cookie. */
export async function POST() {
  const session = await getSession();
  if (!session) return jsonError("Sign in required", 401);
  if (session.role === "admin") return jsonError("Admin accounts stay on the admin desk", 403);

  const user = await prisma.user.update({
    where: { id: session.sub },
    data: { role: "seller" },
  });

  const existingStore = await prisma.sellerStore.findUnique({ where: { userId: user.id } });
  if (!existingStore) {
    const slugBase = user.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
    await prisma.sellerStore.create({
      data: {
        userId: user.id,
        name: `${user.name}'s Store`,
        slug: `${slugBase || "store"}-${user.id.slice(-4)}`,
        city: "Pakistan",
        phone: user.phone,
        bio: "",
      },
    });
  }

  const role = user.role as AuthRole;
  const token = await signSession({
    sub: user.id,
    phone: user.phone,
    name: user.name,
    role,
  });
  await setSessionCookie(token);

  return jsonOk({
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email ?? undefined,
      role,
    },
  });
}
