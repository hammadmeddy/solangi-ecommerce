import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { requireApprovedSeller } from "@/lib/api-auth";
import type { SellerStore } from "@/lib/seller";

function toStore(row: {
  name: string;
  slug: string;
  city: string;
  phone: string;
  bio: string;
  verified: boolean;
  status: string;
  commissionPct: number | null;
  rejectionReason: string | null;
}): SellerStore {
  return {
    name: row.name,
    slug: row.slug,
    city: row.city,
    phone: row.phone,
    bio: row.bio,
    verified: row.verified,
    status: row.status as SellerStore["status"],
    commissionPct: row.commissionPct,
    rejectionReason: row.rejectionReason,
  };
}

const storeSchema = z.object({
  name: z.string().min(1).max(80),
  slug: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  city: z.string().max(80),
  phone: z.string().max(20),
  bio: z.string().max(500),
});

export async function GET() {
  const gate = await requireApprovedSeller();
  if (gate.error) return gate.error;
  const store = await prisma.sellerStore.findUniqueOrThrow({ where: { id: gate.storeId } });
  return jsonOk({ store: toStore(store) });
}

export async function PUT(req: Request) {
  const gate = await requireApprovedSeller();
  if (gate.error) return gate.error;

  const parsed = storeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Check the store fields. Slug uses lowercase letters, numbers, and dashes.", 400);

  const slugTaken = await prisma.sellerStore.findFirst({
    where: { slug: parsed.data.slug, NOT: { id: gate.storeId } },
  });
  if (slugTaken) return jsonError("That store URL is already taken", 409);

  const store = await prisma.sellerStore.update({
    where: { id: gate.storeId },
    data: {
      name: parsed.data.name.trim(),
      slug: parsed.data.slug,
      city: parsed.data.city.trim(),
      phone: parsed.data.phone.trim(),
      bio: parsed.data.bio.trim(),
    },
  });

  await prisma.product.updateMany({
    where: { sellerId: gate.session.sub },
    data: { sellerName: store.name },
  });

  return jsonOk({ store: toStore(store) });
}
