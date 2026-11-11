import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import type { AuthRole } from "@/lib/auth";

const bodySchema = z.object({
  phone: z.string().min(10).max(20),
  name: z.string().min(1).max(80).optional(),
  role: z.enum(["customer", "seller", "admin"]).optional(),
  purpose: z.enum(["login", "register", "admin"]).optional(),
});

/** Demo OTP until SMS gateway is connected. Always issues 123456 in non-production. */
export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) return jsonError("Invalid phone or payload", 400);

    const phone = parsed.data.phone.replace(/\s/g, "");
    const purpose = parsed.data.purpose ?? "login";
    let role: AuthRole = parsed.data.role ?? "customer";
    if (purpose === "admin") role = "admin";

    const existing = await prisma.user.findUnique({ where: { phone } });
    const name =
      parsed.data.name?.trim() ||
      existing?.name ||
      (role === "admin" ? "Solangi Admin" : "Solangi Member");

    if (existing && purpose === "register") {
      // allow re-login style register → still issue OTP for existing phone
    }

    const code =
      process.env.NODE_ENV === "production" && process.env.SOLANGI_FORCE_DEMO_OTP !== "1"
        ? String(Math.floor(100000 + Math.random() * 900000))
        : "123456";

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.otpChallenge.create({
      data: {
        phone,
        code,
        name,
        role,
        purpose,
        expiresAt,
        userId: existing?.id,
      },
    });

    // SMS provider hooks here later — never return the code in production responses.
    return jsonOk({
      ok: true,
      phone,
      demo: process.env.NODE_ENV !== "production",
      hint: process.env.NODE_ENV !== "production" ? "123456" : undefined,
    });
  } catch (err) {
    console.error(err);
    return jsonError("OTP request failed", 500);
  }
}
