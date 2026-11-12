export const ORDER_STATUSES = [
  "placed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

export function isOrderStatus(value: string): value is OrderStatusValue {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}
