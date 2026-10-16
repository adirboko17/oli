"use server";

import { trackVisitorEvent } from "@/lib/storely-track";

export async function trackAddToCart() {
  await trackVisitorEvent("add_to_cart");
}

export async function trackPurchase(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) return false;
  await trackVisitorEvent("purchase", "/checkout", Math.round(amount * 100) / 100);
  return true;
}
