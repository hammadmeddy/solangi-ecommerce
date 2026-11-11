import { CATALOG, type DemoProduct } from "@/lib/products";
import { findModeProduct, MODE_CATALOG } from "@/lib/modes-catalog";
import type { SellerListing, SellerStore } from "@/lib/seller";
import type { ModeId } from "@/lib/categories";

/** Map an active seller listing into a shop product. */
export function listingToProduct(
  listing: SellerListing,
  store: Pick<SellerStore, "name">,
): DemoProduct {
  return {
    id: listing.id,
    name: listing.name,
    categoryId: listing.categoryId,
    category: listing.category,
    pricePkr: listing.pricePkr,
    rating: 5,
    description: listing.description || `${listing.name} from ${store.name}.`,
    seller: store.name,
    stockLabel: listing.stock > 0 ? "In stock" : "Out of stock",
  };
}

export function activeListingProducts(
  listings: SellerListing[],
  store: Pick<SellerStore, "name">,
): DemoProduct[] {
  return listings
    .filter((l) => l.status === "active" && l.stock > 0)
    .map((l) => listingToProduct(l, store));
}

/**
 * Public shop catalog = seed CATALOG + active seller listings.
 * Seller ids win if they collide with a seed id.
 */
export function mergePublicCatalog(
  listings: SellerListing[],
  store: Pick<SellerStore, "name">,
): DemoProduct[] {
  const fromSellers = activeListingProducts(listings, store);
  const sellerIds = new Set(fromSellers.map((p) => p.id));
  const base = CATALOG.filter((p) => !sellerIds.has(p.id));
  return [...fromSellers, ...base];
}

export function findPublicProduct(
  id: string,
  listings: SellerListing[],
  store: Pick<SellerStore, "name">,
): DemoProduct | undefined {
  return (
    mergePublicCatalog(listings, store).find((p) => p.id === id) ??
    findModeProduct(id)
  );
}

export function catalogForMode(
  mode: ModeId,
  listings: SellerListing[],
  store: Pick<SellerStore, "name">,
): DemoProduct[] {
  if (mode === "retail") return mergePublicCatalog(listings, store);
  return MODE_CATALOG.filter((p) => p.mode === mode);
}

export function productsInCategory(
  categoryId: string,
  listings: SellerListing[],
  store: Pick<SellerStore, "name">,
): DemoProduct[] {
  return mergePublicCatalog(listings, store).filter((p) => p.categoryId === categoryId);
}
