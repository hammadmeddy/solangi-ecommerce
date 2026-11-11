export type SellerStore = {
  name: string;
  slug: string;
  city: string;
  bio: string;
  phone: string;
  verified: boolean;
};

export type SellerListing = {
  id: string;
  name: string;
  categoryId: string;
  category: string;
  pricePkr: number;
  stock: number;
  status: "active" | "draft" | "out";
  description: string;
};

export type SellerOrder = {
  id: string;
  placedAt: string;
  buyer: string;
  status: "new" | "accepted" | "shipped" | "completed" | "cancelled";
  totalPkr: number;
  summary: string;
};

export const SELLER_STORAGE = {
  store: "solangi-seller-store",
  listings: "solangi-seller-listings",
} as const;

export const DEMO_SELLER_ORDERS: SellerOrder[] = [
  {
    id: "SO-2201",
    placedAt: "2026-11-09",
    buyer: "Ayesha K.",
    status: "new",
    totalPkr: 4290,
    summary: "Linen blend kurta set × 1",
  },
  {
    id: "SO-2194",
    placedAt: "2026-11-05",
    buyer: "Usman R.",
    status: "shipped",
    totalPkr: 7890,
    summary: "Ceramic dinner set · 16 pcs × 1",
  },
  {
    id: "SO-2170",
    placedAt: "2026-10-28",
    buyer: "Sara M.",
    status: "completed",
    totalPkr: 2490,
    summary: "Herbal skincare trio × 1",
  },
];

export function defaultStore(phone: string, ownerName: string): SellerStore {
  return {
    name: `${ownerName}'s Store`,
    slug: "my-solangi-store",
    city: "Karachi",
    bio: "Independent seller on Solangi Ecommerce. YOUR TRUST IS OUR WEALTH.",
    phone,
    verified: false,
  };
}

export function seedListings(): SellerListing[] {
  return [
    {
      id: "listing-kurta",
      name: "Linen blend kurta set",
      categoryId: "fashion",
      category: "Fashion & Clothing",
      pricePkr: 4290,
      stock: 18,
      status: "active",
      description: "Seller-managed retail listing (demo).",
    },
    {
      id: "listing-dinner",
      name: "Ceramic dinner set · 16 pcs",
      categoryId: "home",
      category: "Home & Kitchen",
      pricePkr: 7890,
      stock: 6,
      status: "active",
      description: "Seller-managed retail listing (demo).",
    },
    {
      id: "listing-draft",
      name: "New seasonal scarf (draft)",
      categoryId: "fashion",
      category: "Fashion & Clothing",
      pricePkr: 1290,
      stock: 0,
      status: "draft",
      description: "Draft listing — not visible in shop yet.",
    },
  ];
}
