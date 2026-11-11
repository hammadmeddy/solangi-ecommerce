export type Category = {
  id: string;
  name: string;
  photoLabel: string;
  href?: "services-mode" | "category";
};

/** Locked taxonomy — all 18. Services tile opens Services C2B mode. */
export const CATEGORIES: Category[] = [
  { id: "computers", name: "Computers & Laptops", photoLabel: "Computers", href: "category" },
  { id: "fashion", name: "Fashion & Clothing", photoLabel: "Fashion", href: "category" },
  { id: "shoes", name: "Shoes & Bags", photoLabel: "Shoes", href: "category" },
  { id: "home", name: "Home & Kitchen", photoLabel: "Home", href: "category" },
  { id: "grocery", name: "Grocery & Food", photoLabel: "Grocery", href: "category" },
  { id: "beauty", name: "Beauty & Personal Care", photoLabel: "Beauty", href: "category" },
  { id: "health", name: "Health & Fitness", photoLabel: "Health", href: "category" },
  { id: "baby", name: "Baby & Kids", photoLabel: "Baby", href: "category" },
  { id: "sports", name: "Sports & Outdoor", photoLabel: "Sports", href: "category" },
  { id: "auto", name: "Automotive", photoLabel: "Auto", href: "category" },
  { id: "agri", name: "Agriculture & Farming", photoLabel: "Agri", href: "category" },
  { id: "industrial", name: "Industrial & Machinery", photoLabel: "Industrial", href: "category" },
  { id: "construction", name: "Construction Materials", photoLabel: "Construction", href: "category" },
  { id: "books", name: "Books & Education", photoLabel: "Books", href: "category" },
  { id: "furniture", name: "Furniture", photoLabel: "Furniture", href: "category" },
  { id: "toys", name: "Toys & Games", photoLabel: "Toys", href: "category" },
  { id: "jewellery", name: "Jewellery & Watches", photoLabel: "Jewellery", href: "category" },
  { id: "services", name: "Services", photoLabel: "Services", href: "services-mode" },
];

export const MODES = [
  { id: "retail", label: "Retail", sub: "B2C" },
  { id: "wholesale", label: "Wholesale", sub: "B2B" },
  { id: "used", label: "Used", sub: "C2C" },
  { id: "services", label: "Services", sub: "C2B" },
] as const;

export type ModeId = (typeof MODES)[number]["id"];
