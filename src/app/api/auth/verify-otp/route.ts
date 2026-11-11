import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { setSessionCookie, signSession } from "@/lib/session";
import type { AuthRole } from "@/lib/auth";

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

    const user = await prisma.user.upsert({
      where: { phone },
      update: {
        name: challenge.name || undefined,
        role: challenge.role,
      },
      create: {
        phone,
        name: challenge.name || "Solangi Member",
        role: challenge.role,
      },
    });

    if (user.role === "seller") {
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
  } catch (err) {
    console.error(err);
    return jsonError("Verify failed", 500);
  }
}
