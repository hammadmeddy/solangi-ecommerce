import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { requireRoles } from "@/lib/api-auth";
import type { SellerStore } from "@/lib/seller";

function toStore(row: {
  name: string;
  slug: string;
  city: string;
  phone: string;
  bio: string;
  verified: boolean;
}): SellerStore {
  return {
    name: row.name,
    slug: row.slug,
    city: row.city,
    phone: row.phone,
    bio: row.bio,
    verified: row.verified,
  };
}

async function ensureStore(userId: string, name: string, phone: string) {
  const existing = await prisma.sellerStore.findUnique({ where: { userId } });
  if (existing) return existing;
  const slugBase = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return prisma.sellerStore.create({
    data: {
      userId,
      name: `${name}'s Store`,
      slug: `${slugBase || "store"}-${userId.slice(-4)}`,
      city: "Pakistan",
      phone,
      bio: "",
    },
  });
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
  const gate = await requireRoles(["seller"]);
  if (gate.error) return gate.error;
  const store = await ensureStore(gate.session.sub, gate.session.name, gate.session.phone);
  return jsonOk({ store: toStore(store) });
}

export async function PUT(req: Request) {
  const gate = await requireRoles(["seller"]);
  if (gate.error) return gate.error;

  const parsed = storeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Check the store fields. Slug uses lowercase letters, numbers, and dashes.", 400);

  const current = await ensureStore(gate.session.sub, gate.session.name, gate.session.phone);
  const slugTaken = await prisma.sellerStore.findFirst({
    where: { slug: parsed.data.slug, NOT: { id: current.id } },
  });
  if (slugTaken) return jsonError("That store URL is already taken", 409);

  const store = await prisma.sellerStore.update({
    where: { id: current.id },
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
