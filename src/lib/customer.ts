export type CustomerAddress = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  province: string;
  isDefault: boolean;
};

export type OrderStatus = "placed" | "packed" | "shipped" | "delivered" | "cancelled";

export type CustomerOrder = {
  id: string;
  placedAt: string;
  status: OrderStatus;
  totalPkr: number;
  itemCount: number;
  summary: string;
};

export type WishlistItem = {
  productId: string;
  name: string;
  category: string;
  pricePkr: number;
  addedAt: string;
};

export const CUSTOMER_STORAGE = {
  profileExtra: "solangi-customer-profile",
  addresses: "solangi-customer-addresses",
  wishlist: "solangi-customer-wishlist",
} as const;

export const DEMO_ORDERS: CustomerOrder[] = [
  {
    id: "SE-10024",
    placedAt: "2026-11-08",
    status: "shipped",
    totalPkr: 9180,
    itemCount: 2,
    summary: "Linen kurta set · Ceramic dinner set",
  },
  {
    id: "SE-10011",
    placedAt: "2026-10-22",
    status: "delivered",
    totalPkr: 2850,
    itemCount: 1,
    summary: "Premium basmati · 5 kg",
  },
  {
    id: "SE-09980",
    placedAt: "2026-09-30",
    status: "cancelled",
    totalPkr: 1450,
    itemCount: 1,
    summary: "Car phone mount · magnetic",
  },
];

export const DEFAULT_ADDRESSES: CustomerAddress[] = [
  {
    id: "addr-home",
    label: "Home",
    fullName: "",
    phone: "",
    line1: "House 12, Street 7",
    line2: "Gulshan-e-Iqbal",
    city: "Karachi",
    province: "Sindh",
    isDefault: true,
  },
];
