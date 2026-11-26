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
