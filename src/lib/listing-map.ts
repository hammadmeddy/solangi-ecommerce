import type { Category, Product } from "@prisma/client";
import type { SellerListing, SellerListingStatus } from "@/lib/seller";

const KNOWN: SellerListingStatus[] = ["active", "draft", "out", "pending", "rejected"];

export function toSellerListing(
  product: Product & { category: Pick<Category, "name"> },
): SellerListing {
  const status = (KNOWN as string[]).includes(product.status)
    ? (product.status as SellerListingStatus)
    : "draft";
  return {
    id: product.id,
    name: product.name,
    categoryId: product.categoryId,
    category: product.category.name,
    pricePkr: product.pricePkr,
    stock: product.stock,
    status,
    description: product.description,
    imageUrl: product.imageUrl,
    reviewNote: product.reviewNote,
  };
}

export function stockLabelFor(stock: number, status?: string) {
  if (status === "out" || stock <= 0) return "Out of stock";
  if (stock < 5) return "Limited";
  return "In stock";
}

/**
 * Status a seller listing gets after a save.
 * - "Save as draft" always gives draft.
 * - A live listing where only stock changed stays live (or goes out at 0).
 * - Anything else that is submitted goes to admin review.
 */
export function nextListingStatus(
  existing: Pick<Product, "status" | "name" | "pricePkr" | "description" | "categoryId" | "imageUrl"> | null,
  input: { draft: boolean; stock: number; name: string; pricePkr: number; description?: string; categoryId: string; imageUrl?: string | null },
): SellerListingStatus {
  if (input.draft) return "draft";
  if (existing && (existing.status === "active" || existing.status === "out")) {
    const contentChanged =
      existing.name !== input.name.trim() ||
      existing.pricePkr !== input.pricePkr ||
      existing.categoryId !== input.categoryId ||
      (input.description !== undefined && existing.description !== input.description.trim()) ||
      (input.imageUrl !== undefined && existing.imageUrl !== input.imageUrl);
    if (!contentChanged) return input.stock > 0 ? "active" : "out";
  }
  return "pending";
}
