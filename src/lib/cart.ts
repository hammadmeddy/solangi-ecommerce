export type CartLine = {
  productId: string;
  name: string;
  category: string;
  categoryId: string;
  pricePkr: number;
  qty: number;
};

export type PlacedOrder = {
  id: string;
  placedAt: string;
  status: "placed";
  totalPkr: number;
  itemCount: number;
  summary: string;
  payment: "COD";
  addressLabel: string;
};

export const CART_STORAGE_KEY = "solangi-cart";
export const PLACED_ORDERS_KEY = "solangi-placed-orders";

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.pricePkr * line.qty, 0);
}
