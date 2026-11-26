import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { setSessionCookie, signSession } from "@/lib/session";
import type { AuthRole } from "@/lib/auth";
import { isAdminPhone } from "@/lib/api-auth";

const bodySchema = z.object({
  phone: z.string().min(10).max(20),
  code: z.string().regex(/^\d{6}$/),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) return jsonError("Enter a valid 6-digit code", 400);

    const phone = parsed.data.phone.replace(/\s/g, "");
    const code = parsed.data.code;

    const challenge = await prisma.otpChallenge.findFirst({
      where: { phone, consumed: false },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        phone: true,
        email: true,
        code: true,
        name: true,
        role: true,
        purpose: true,
        expiresAt: true,
      },
    });

    if (!challenge || challenge.code !== code) {
      return jsonError("Invalid or expired code", 401);
    }
    if (challenge.expiresAt.getTime() < Date.now()) {
      return jsonError("Code expired — request a new one", 401);
    }

    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumed: true },
    });

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser && existingUser.status !== "active") {
      return jsonError("This account is suspended. Contact Solangi support.", 403);
    }
    const email = challenge.email?.trim().toLowerCase() || undefined;

    // Only an admin sign-in may grant "admin", and request-otp already checked
    // the phone. Everything else keeps the stored role or starts as customer.
    const grantAdmin =
      challenge.purpose === "admin" && isAdminPhone(phone, existingUser?.role);

    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            ...(email && existingUser.email !== email ? { email } : {}),
            ...(grantAdmin && existingUser.role !== "admin" ? { role: "admin" } : {}),
            ...(challenge.purpose === "register" && challenge.name
              ? { name: challenge.name }
              : {}),
          },
        })
      : await prisma.user.create({
          data: {
            phone,
            name: challenge.name || "Solangi Member",
            role: grantAdmin ? "admin" : "customer",
            email,
          },
        });

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
  } catch (err) {
    console.error(err);
    return jsonError("Verify failed", 500);
  }
}
