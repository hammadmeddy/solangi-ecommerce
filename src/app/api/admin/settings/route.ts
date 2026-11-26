import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { requireRoles } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireRoles(["admin"]);
  if (auth.error) return auth.error;
  const site = await prisma.siteSetting.upsert({
    where: { id: "solo" },
    update: {},
    create: { id: "solo" },
  });
  return jsonOk({ settings: { defaultCommissionPct: site.defaultCommissionPct } });
}

const bodySchema = z.object({ defaultCommissionPct: z.number().int().min(0).max(90) });

/** Applies to orders placed after the change; existing order lines keep their commission. */
export async function PATCH(req: Request) {
  const auth = await requireRoles(["admin"]);
  if (auth.error) return auth.error;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Commission must be 0–90%", 400);
  const site = await prisma.siteSetting.upsert({
    where: { id: "solo" },
    update: { defaultCommissionPct: parsed.data.defaultCommissionPct },
    create: { id: "solo", defaultCommissionPct: parsed.data.defaultCommissionPct },
  });
  return jsonOk({ settings: { defaultCommissionPct: site.defaultCommissionPct } });
}
