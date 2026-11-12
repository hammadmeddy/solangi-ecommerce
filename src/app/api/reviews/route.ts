import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { getSession } from "@/lib/session";

const createSchema = z.object({
  quote: z.string().min(8).max(500),
  author: z.string().min(2).max(80),
  meta: z.string().max(120).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  locale: z.string().min(2).max(5).optional(),
  productId: z.string().optional(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const locale = url.searchParams.get("locale") || undefined;
  const all = url.searchParams.get("all") === "1";
  const session = await getSession();
  const isAdmin = session?.role === "admin";

  const reviews = await prisma.review.findMany({
    where: {
      ...(all && isAdmin ? {} : { status: "approved" }),
      ...(locale ? { OR: [{ locale }, { locale: "en" }] } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 50,
  });

  return jsonOk({
    reviews: reviews.map((r) => ({
      id: r.id,
      quote: r.quote,
      author: r.author,
      meta: r.meta,
      rating: r.rating,
      status: r.status,
      locale: r.locale,
      sortOrder: r.sortOrder,
      productId: r.productId,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  try {
    const json = await req.json();
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) return jsonError("Invalid review payload", 400);

    const isAdmin = session?.role === "admin";
    const review = await prisma.review.create({
      data: {
        quote: parsed.data.quote.trim(),
        author:
          parsed.data.author.trim() ||
          session?.name ||
          "Solangi shopper",
        meta: parsed.data.meta?.trim() || "",
        rating: parsed.data.rating ?? 5,
        locale: parsed.data.locale || "en",
        productId: parsed.data.productId || null,
        userId: session?.sub,
        status: isAdmin ? "approved" : "pending",
        sortOrder: 100,
      },
    });

    return jsonOk({
      review: {
        id: review.id,
        quote: review.quote,
        author: review.author,
        meta: review.meta,
        rating: review.rating,
        status: review.status,
      },
    });
  } catch (err) {
    console.error(err);
    return jsonError("Could not submit review", 500);
  }
}
