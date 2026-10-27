export type ShippingChoice = {
  name: string;
  price: number;
  zone: string;
};

export const FREE_SHIPPING_FROM = 250;

export function shippingAfterFreeThreshold(subtotal: number, shipping: number | null, total: number) {
  if (subtotal < FREE_SHIPPING_FROM || shipping == null || shipping <= 0) return { shipping, total };
  return { shipping: 0, total: Math.round((total - shipping) * 100) / 100 };
}

const SYMBOLS: Record<string, string> = { ILS: "₪", USD: "$", EUR: "€" };

export function isPickupZone(zone: string) {
  return /pickup|collect|locker|איסוף|נקוד/i.test(zone);
}

export function formatMoney(amount: number, currency: string) {
  const rounded = Math.round(amount * 100) / 100;
  const text = Number.isInteger(rounded)
    ? rounded.toLocaleString("he-IL")
    : rounded.toLocaleString("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const symbol = SYMBOLS[currency];
  return symbol ? symbol + text : `${text} ${currency}`.trim();
}

export function formatShippingPrice(price: number, currency: string) {
  return price === 0 ? "משלוח חינם" : formatMoney(price, currency);
}
