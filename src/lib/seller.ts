export type SellerStoreStatus = "pending" | "approved" | "rejected" | "suspended";

export type SellerStore = {
  name: string;
  slug: string;
  city: string;
  bio: string;
  phone: string;
  verified: boolean;
  status?: SellerStoreStatus;
  /** null = the platform default applies */
  commissionPct?: number | null;
  rejectionReason?: string | null;
};

/** What a customer sees about their seller application. */
export type SellerApplication = {
  status: SellerStoreStatus;
  name: string;
  city: string;
  phone: string;
  cnic: string;
  bio: string;
  rejectionReason: string | null;
  appliedAt: string;
};

export type SellerListingStatus = "active" | "draft" | "out" | "pending" | "rejected";

export type SellerListing = {
  id: string;
  name: string;
  categoryId: string;
  category: string;
  pricePkr: number;
  stock: number;
  status: SellerListingStatus;
  description: string;
  imageUrl?: string | null;
  reviewNote?: string | null;
};

/** One order as the seller sees it: only their own lines. */
export type SellerOrder = {
  id: string;
  placedAt: string;
  buyer: string;
  city: string;
  /** Full address and phone appear once the seller has packed the order */
  address: string | null;
  phone: string | null;
  /** The whole order's status (admin controls delivered/cancelled) */
  orderStatus: string;
  /** The seller's own progress on their lines */
  status: string;
  totalPkr: number;
  commissionPkr: number;
  summary: string;
  lines: { id: string; name: string; qty: number; pricePkr: number; itemStatus: string }[];
};

export type SellerEarnings = {
  grossPkr: number;
  commissionPkr: number;
  netPkr: number;
  paidPkr: number;
  pendingPayoutPkr: number;
  availablePkr: number;
  openPkr: number;
  commissionPct: number;
  payouts: {
    id: string;
    amountPkr: number;
    periodLabel: string;
    status: "pending" | "paid";
    note: string;
    paidAt: string | null;
    createdAt: string;
  }[];
};

export const SELLER_STORAGE = {
  store: "solangi-seller-store",
  listings: "solangi-seller-listings",
} as const;

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
