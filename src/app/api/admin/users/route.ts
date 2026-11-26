import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/api-map";
import { requireRoles } from "@/lib/api-auth";

export async function GET(req: Request) {
  const auth = await requireRoles(["admin"]);
  if (auth.error) return auth.error;

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const role = url.searchParams.get("role") ?? "";
  const status = url.searchParams.get("status") ?? "";

  const users = await prisma.user.findMany({
    where: {
      ...(["customer", "seller", "admin"].includes(role) ? { role } : {}),
      ...(["active", "suspended"].includes(status) ? { status } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { phone: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 300,
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      status: true,
      city: true,
      createdAt: true,
      store: { select: { id: true, name: true, status: true } },
      _count: { select: { orders: true } },
    },
  });

  return jsonOk({
    users: users.map(({ _count, createdAt, ...user }) => ({
      ...user,
      orderCount: _count.orders,
      createdAt: createdAt.toISOString(),
    })),
  });
}
