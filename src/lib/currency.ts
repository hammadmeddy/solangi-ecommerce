export const CURRENCIES = ["PKR", "USD", "AED", "EUR", "GBP"] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

/** Display-only rates for design/MVP preview — not live FX. */
export const DISPLAY_RATES: Record<CurrencyCode, number> = {
  PKR: 1,
  USD: 1 / 278,
  AED: 1 / 75.7,
  EUR: 1 / 302,
  GBP: 1 / 352,
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  PKR: "Rs ",
  USD: "$",
  AED: "AED ",
  EUR: "€",
  GBP: "£",
};

export function formatDisplayPrice(pkr: number, code: CurrencyCode): string {
  const value = pkr * DISPLAY_RATES[code];
  if (code === "PKR") {
    return `${CURRENCY_SYMBOLS.PKR}${Math.round(value).toLocaleString("en-PK")}`;
  }
  return `${CURRENCY_SYMBOLS[code]}${value.toLocaleString("en", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
}
