import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { getActiveSession } from "@/lib/api-auth";
import { setSessionCookie, signSession } from "@/lib/session";
import type { AuthRole } from "@/lib/auth";

// Phone is the sign-in identity, so it is not editable here.
const bodySchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.union([z.string().trim().email().max(120), z.literal("")]).optional(),
  city: z.string().trim().max(60).optional(),
});

export async function PATCH(req: Request) {
  const session = await getActiveSession();
  if (!session) return jsonError("Sign in required", 401);

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Check your name and email", 400);

  const user = await prisma.user.update({
    where: { id: session.sub },
    data: {
      name: parsed.data.name,
      ...(parsed.data.email !== undefined
        ? { email: parsed.data.email ? parsed.data.email.toLowerCase() : null }
        : {}),
      ...(parsed.data.city !== undefined ? { city: parsed.data.city || null } : {}),
    },
  });

  // Keep the cookie's display name in step.
  await setSessionCookie(
    await signSession({ sub: user.id, phone: user.phone, name: user.name, role: user.role as AuthRole }),
  );

  return jsonOk({
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email ?? undefined,
      city: user.city ?? undefined,
      role: user.role,
    },
  });
}
