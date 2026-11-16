import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { requireRoles } from "@/lib/api-auth";

const bodySchema = z.object({
  role: z.enum(["customer", "seller", "admin"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRoles(["admin"]);
  if (auth.error) return auth.error;

  const { id } = await params;
  if (id === auth.session.sub) return jsonError("You cannot change your own role", 400);

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return jsonError("Invalid role", 400);

  const user = await prisma.user.update({
    where: { id },
    data: { role: parsed.data.role },
    select: { id: true, name: true, phone: true, email: true, role: true },
  });

  if (parsed.data.role === "seller") {
    const store = await prisma.sellerStore.findUnique({ where: { userId: user.id } });
    if (!store) {
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

  return jsonOk({ user });
}
