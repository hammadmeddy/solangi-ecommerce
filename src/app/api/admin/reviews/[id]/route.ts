import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { getSession } from "@/lib/session";

const patchSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  quote: z.string().min(8).max(500).optional(),
  author: z.string().min(2).max(80).optional(),
  meta: z.string().max(120).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return jsonError("Unauthorized", 401);
  }

  try {
    const { id } = await ctx.params;
    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) return jsonError("Invalid review update", 400);

    const review = await prisma.review.update({
      where: { id },
      data: parsed.data,
    });

    return jsonOk({
      review: {
        id: review.id,
        quote: review.quote,
        author: review.author,
        meta: review.meta,
        rating: review.rating,
        status: review.status,
        sortOrder: review.sortOrder,
      },
    });
  } catch (err) {
    console.error(err);
    return jsonError("Could not update review", 500);
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return jsonError("Unauthorized", 401);
  }

  try {
    const { id } = await ctx.params;
    await prisma.review.delete({ where: { id } });
    return jsonOk({ ok: true });
  } catch (err) {
    console.error(err);
    return jsonError("Could not delete review", 500);
  }
}
