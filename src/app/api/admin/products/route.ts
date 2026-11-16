import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, productToDemo } from "@/lib/api-map";
import { requireRoles } from "@/lib/api-auth";

const bodySchema = z.object({
  name: z.string().min(2).max(160),
  categoryId: z.string().min(1),
  pricePkr: z.number().int().positive(),
  stock: z.number().int().min(0).default(10),
  description: z.string().max(2000).optional(),
  mode: z.enum(["retail", "wholesale", "used", "services"]).default("retail"),
  status: z.enum(["active", "draft", "out"]).default("active"),
  sellerName: z.string().max(80).optional(),
});

export async function GET() {
  const auth = await requireRoles(["admin"]);
  if (auth.error) return auth.error;

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { updatedAt: "desc" },
    take: 500,
  });

  return jsonOk({
    products: products.map((product) => ({
      ...productToDemo(product),
      stock: product.stock,
      status: product.status,
    })),
  });
}

export async function POST(req: Request) {
  const auth = await requireRoles(["admin"]);
  if (auth.error) return auth.error;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return jsonError("Invalid product", 400);

  const category = await prisma.category.findUnique({
    where: { id: parsed.data.categoryId },
  });
  if (!category) return jsonError("Unknown category", 400);

  const id = `adm-${Date.now().toString(36)}`;
  const product = await prisma.product.create({
    data: {
      id,
      name: parsed.data.name.trim(),
      categoryId: category.id,
      pricePkr: parsed.data.pricePkr,
      stock: parsed.data.stock,
      stockLabel: parsed.data.stock > 0 ? "In stock" : "Out of stock",
      description: parsed.data.description?.trim() || parsed.data.name.trim(),
      sellerName: parsed.data.sellerName?.trim() || "Solangi",
      mode: parsed.data.mode,
      status: parsed.data.status,
    },
    include: { category: true },
  });

  return jsonOk({
    product: { ...productToDemo(product), stock: product.stock, status: product.status },
  });
}
