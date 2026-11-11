import type { ModeId } from "@/lib/categories";
import { productMode, type DemoProduct } from "@/lib/products";

export type SearchFilters = {
  q: string;
  mode: ModeId | "all";
  categoryId: string | "all";
  minPrice: number | null;
  maxPrice: number | null;
  sort: "relevance" | "price-asc" | "price-desc";
};

export function parseSearchFilters(input: {
  q?: string;
  mode?: string;
  cat?: string;
  min?: string;
  max?: string;
  sort?: string;
}): SearchFilters {
  const modes: Array<ModeId | "all"> = ["all", "retail", "wholesale", "used", "services"];
  const mode = modes.includes(input.mode as ModeId | "all")
    ? (input.mode as ModeId | "all")
    : "all";
  const sort =
    input.sort === "price-asc" || input.sort === "price-desc" ? input.sort : "relevance";
  const minPrice = input.min && !Number.isNaN(Number(input.min)) ? Number(input.min) : null;
  const maxPrice = input.max && !Number.isNaN(Number(input.max)) ? Number(input.max) : null;

  return {
    q: (input.q ?? "").trim(),
    mode,
    categoryId: input.cat?.trim() || "all",
    minPrice,
    maxPrice,
    sort,
  };
}

function scoreProduct(product: DemoProduct, q: string): number {
  if (!q) return 1;
  const needle = q.toLowerCase();
  const name = product.name.toLowerCase();
  const category = product.category.toLowerCase();
  const seller = product.seller.toLowerCase();
  const desc = product.description.toLowerCase();
  let score = 0;
  if (name === needle) score += 100;
  if (name.startsWith(needle)) score += 60;
  if (name.includes(needle)) score += 40;
  if (category.includes(needle)) score += 20;
  if (seller.includes(needle)) score += 15;
  if (desc.includes(needle)) score += 8;
  return score;
}

export function filterProducts(
  products: DemoProduct[],
  filters: SearchFilters,
): DemoProduct[] {
  const q = filters.q.toLowerCase();

  let list = products.filter((product) => {
    const mode = productMode(product);
    if (filters.mode !== "all" && mode !== filters.mode) return false;
    if (filters.categoryId !== "all" && product.categoryId !== filters.categoryId) {
      return false;
    }
    if (filters.minPrice != null && product.pricePkr < filters.minPrice) return false;
    if (filters.maxPrice != null && product.pricePkr > filters.maxPrice) return false;
    if (!q) return true;
    return scoreProduct(product, q) > 0;
  });

  if (filters.sort === "price-asc") {
    list = [...list].sort((a, b) => a.pricePkr - b.pricePkr);
  } else if (filters.sort === "price-desc") {
    list = [...list].sort((a, b) => b.pricePkr - a.pricePkr);
  } else if (q) {
    list = [...list].sort(
      (a, b) => scoreProduct(b, q) - scoreProduct(a, q) || a.name.localeCompare(b.name),
    );
  } else {
    list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  }

  return list;
}
