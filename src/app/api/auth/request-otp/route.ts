import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import type { AuthRole } from "@/lib/auth";
import { sendOtpEmail, smtpConfigured } from "@/lib/mail";

const bodySchema = z.object({
  phone: z.string().min(10).max(20),
  email: z.string().email().optional(),
  name: z.string().min(1).max(80).optional(),
  role: z.enum(["customer", "seller", "admin"]).optional(),
  purpose: z.enum(["login", "register", "admin"]).optional(),
});

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
    const email =
      parsed.data.email?.trim().toLowerCase() ||
      existing?.email?.trim().toLowerCase() ||
      "";

    if (!email) {
      return jsonError("Email is required to receive your OTP code", 400);
    }

    const name =
      parsed.data.name?.trim() ||
      existing?.name ||
      (role === "admin" ? "Solangi Admin" : "Solangi Member");

    const forceDemo = process.env.SOLANGI_FORCE_DEMO_OTP === "1";
    const code = forceDemo
      ? "123456"
      : String(Math.floor(100000 + Math.random() * 900000));

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.otpChallenge.create({
      data: {
        phone,
        email,
        code,
        name,
        role,
        purpose,
        expiresAt,
        userId: existing?.id,
      },
    });

    let emailed = false;
    let delivery: "email" | "demo" = "demo";

    if (smtpConfigured() && !forceDemo) {
      try {
        await sendOtpEmail(email, code);
        emailed = true;
        delivery = "email";
      } catch (err) {
        console.error("OTP email failed", err);
        if (process.env.NODE_ENV === "production") {
          return jsonError("Could not send OTP email. Try again shortly.", 502);
        }
      }
    } else if (process.env.NODE_ENV === "production" && !forceDemo) {
      return jsonError("Email OTP is not configured on the server", 503);
    }

    const mask = email.replace(/(.{2}).+(@.+)/, "$1***$2");
    return jsonOk({
      ok: true,
      phone,
      emailMasked: mask,
      delivery,
      demo: !emailed,
      hint: !emailed ? code : undefined,
    });
  } catch (err) {
    console.error(err);
    return jsonError("OTP request failed", 500);
  }
}
