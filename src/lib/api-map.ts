import type { Product } from "@prisma/client";
import type { DemoProduct } from "@/lib/products";
import type { ModeId } from "@/lib/categories";

export function productToDemo(p: Product & { category?: { name: string } }): DemoProduct {
  return {
    id: p.id,
    name: p.name,
    categoryId: p.categoryId,
    category: p.category?.name ?? p.categoryId,
    pricePkr: p.pricePkr,
    oldPricePkr: p.oldPricePkr ?? undefined,
    discountLabel: p.discountLabel ?? undefined,
    rating: p.rating,
    description: p.description,
    seller: p.sellerName,
    stockLabel: p.stockLabel,
    mode: (p.mode as ModeId) || "retail",
    minQty: p.minQty ?? undefined,
    condition: p.condition ?? undefined,
    serviceArea: p.serviceArea ?? undefined,
    imageUrl: p.imageUrl ?? undefined,
    sellerOwned: Boolean(p.sellerId),
  };
}

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return Response.json(data, { status: 200, ...init });
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
