import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/api-map";
import { clearSessionCookie, getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonOk({ user: null });

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) {
    await clearSessionCookie();
    return jsonOk({ user: null });
  }

  return jsonOk({
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
    },
  });
}
