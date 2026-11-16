import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/api-map";
import { requireRoles } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireRoles(["admin"]);
  if (auth.error) return auth.error;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return jsonOk({
    users: users.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
    })),
  });
}
