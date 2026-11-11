import type { Category, Product } from "@prisma/client";
import type { SellerListing } from "@/lib/seller";

export function toSellerListing(
  product: Product & { category: Pick<Category, "name"> },
): SellerListing {
  const status =
    product.status === "draft" || product.status === "out" ? product.status : "active";
  return {
    id: product.id,
    name: product.name,
    categoryId: product.categoryId,
    category: product.category.name,
    pricePkr: product.pricePkr,
    stock: product.stock,
    status,
    description: product.description,
  };
}

export function stockLabelFor(stock: number, status: SellerListing["status"]) {
  if (status === "out" || stock <= 0) return "Out of stock";
  if (stock < 5) return "Limited";
  return "In stock";
}
