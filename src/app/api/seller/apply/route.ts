import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { getActiveSession } from "@/lib/api-auth";
import { slugify } from "@/lib/seller-store";
import type { SellerApplication } from "@/lib/seller";

function toApplication(row: {
  status: string;
  name: string;
  city: string;
  phone: string;
  cnic: string | null;
  bio: string;
  rejectionReason: string | null;
  appliedAt: Date;
}): SellerApplication {
  return {
    status: row.status as SellerApplication["status"],
    name: row.name,
    city: row.city,
    phone: row.phone,
    cnic: row.cnic ?? "",
    bio: row.bio,
    rejectionReason: row.rejectionReason,
    appliedAt: row.appliedAt.toISOString(),
  };
}

/** The signed-in member's seller application, if any. */
export async function GET() {
  const session = await getActiveSession();
  if (!session) return jsonError("Sign in required", 401);
  const store = await prisma.sellerStore.findUnique({ where: { userId: session.sub } });
  return jsonOk({ application: store ? toApplication(store) : null });
}

const applySchema = z.object({
  name: z.string().min(2).max(80),
  city: z.string().min(2).max(60),
  phone: z.string().min(10).max(20),
  /** Pakistani CNIC: 13 digits, dashes optional */
  cnic: z.string().regex(/^\d{5}-?\d{7}-?\d$/, "Enter a valid CNIC"),
  bio: z.string().min(10).max(600),
});

/** Submit (or re-submit after rejection). Admin approves it in /admin/sellers. */
export async function POST(req: Request) {
  const session = await getActiveSession();
  if (!session) return jsonError("Sign in required", 401);
  if (session.role === "admin") return jsonError("Admin accounts cannot open a store", 403);

  const parsed = applySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Check the application fields", 400);
  }
  const input = parsed.data;

  const existing = await prisma.sellerStore.findUnique({ where: { userId: session.sub } });
  if (existing?.status === "approved") return jsonError("Your store is already approved", 409);
  if (existing?.status === "suspended") {
    return jsonError("Your store is suspended. Contact Solangi support.", 403);
  }

  let slug = slugify(input.name) || "store";
  const clash = await prisma.sellerStore.findFirst({
    where: { slug, NOT: { userId: session.sub } },
  });
  if (clash) slug = `${slug}-${session.sub.slice(-4)}`;

  const data = {
    name: input.name.trim(),
    slug,
    city: input.city.trim(),
    phone: input.phone.replace(/\s/g, ""),
    cnic: input.cnic.replace(/-/g, "").replace(/^(\d{5})(\d{7})(\d)$/, "$1-$2-$3"),
    bio: input.bio.trim(),
    status: "pending",
    rejectionReason: null,
    appliedAt: new Date(),
    reviewedAt: null,
  };

  const store = existing
    ? await prisma.sellerStore.update({ where: { id: existing.id }, data })
    : await prisma.sellerStore.create({ data: { ...data, userId: session.sub } });

  return jsonOk({ application: toApplication(store) }, { status: existing ? 200 : 201 });
}
