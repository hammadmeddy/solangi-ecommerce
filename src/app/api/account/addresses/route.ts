import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { requireRoles } from "@/lib/api-auth";

const bodySchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1).max(40),
  fullName: z.string().min(1).max(80),
  phone: z.string().min(6).max(20),
  line1: z.string().min(3).max(160),
  line2: z.string().max(160).optional(),
  city: z.string().min(2).max(80),
  province: z.string().max(80).optional(),
  isDefault: z.boolean().optional(),
});

function toClient(row: {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  province: string;
  isDefault: boolean;
}) {
  return {
    ...row,
    line2: row.line2 || undefined,
  };
}

export async function GET() {
  const auth = await requireRoles(["customer", "seller", "admin"]);
  if (auth.error) return auth.error;

  const rows = await prisma.address.findMany({
    where: { userId: auth.session.sub },
    orderBy: [{ isDefault: "desc" }, { label: "asc" }],
  });
  return jsonOk({ addresses: rows.map(toClient) });
}

export async function POST(req: Request) {
  const auth = await requireRoles(["customer", "seller", "admin"]);
  if (auth.error) return auth.error;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return jsonError("Invalid address", 400);

  const userId = auth.session.sub;
  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const data = {
    label: parsed.data.label.trim(),
    fullName: parsed.data.fullName.trim(),
    phone: parsed.data.phone.trim(),
    line1: parsed.data.line1.trim(),
    line2: parsed.data.line2?.trim() || "",
    city: parsed.data.city.trim(),
    province: parsed.data.province?.trim() || "",
    isDefault: Boolean(parsed.data.isDefault),
  };

  let saved;
  if (parsed.data.id) {
    const owned = await prisma.address.findFirst({
      where: { id: parsed.data.id, userId },
    });
    if (!owned) return jsonError("Not allowed", 403);
    saved = await prisma.address.update({ where: { id: owned.id }, data });
  } else {
    saved = await prisma.address.create({ data: { ...data, userId } });
  }

  return jsonOk({ address: toClient(saved) });
}

export async function DELETE(req: Request) {
  const auth = await requireRoles(["customer", "seller", "admin"]);
  if (auth.error) return auth.error;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return jsonError("Missing address", 400);

  await prisma.address.deleteMany({
    where: { id, userId: auth.session.sub },
  });
  return jsonOk({ ok: true });
}
