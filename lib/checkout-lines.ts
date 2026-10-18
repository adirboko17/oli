import "server-only";
import { giftAmountsFromTags, OPEN_GIFT_MAX, OPEN_GIFT_MIN, openGiftMax, type CatalogProduct } from "@/lib/catalog-model";
import type { StoreLine } from "@/lib/storely-shop";

function giftAmount(raw: string) {
  const amount = Math.round(Number(raw) * 100) / 100;
  return Number.isFinite(amount) ? amount : null;
}

export function resolvePrice(products: CatalogProduct[], id: string) {
  const card = /^oli-gift:(\d+(?:\.\d+)?)$/.exec(id);
  if (card) {
    const amount = giftAmount(card[1]);
    if (amount == null || amount < OPEN_GIFT_MIN || amount > OPEN_GIFT_MAX) return null;
    return amount;
  }
  const gift = /^(.*):gift:(\d+(?:\.\d+)?)$/.exec(id);
  if (gift) {
    const amount = giftAmount(gift[2]);
    const product = products.find((item) => item.id === gift[1]);
    if (!product || amount == null) return null;
    const preset = giftAmountsFromTags(product.tags).includes(amount);
    const max = openGiftMax(product.tags);
    const custom = max != null && amount >= OPEN_GIFT_MIN && amount <= max;
    if (!preset && !custom) return null;
    return amount;
  }
  const bundle = /^(.+):x(\d+)$/.exec(id);
  const baseId = bundle?.[1] ?? id;
  const bundleQty = bundle ? Number(bundle[2]) : null;
  for (const product of products) {
    const variant = product.variants.find((item) => item.id === baseId);
    if (product.id !== baseId && !variant) continue;
    if (bundleQty) {
      const pack = product.bundles.find((item) => item.qty === bundleQty);
      return pack ? pack.price : null;
    }
    return variant?.price ?? product.price;
  }
  return null;
}

export function skippedStoreLine(id: string) {
  return id.startsWith("oli-gift:") || id.includes(":gift:") || /:x\d+$/.test(id);
}

export function variantForLine(products: CatalogProduct[], id: string) {
  for (const product of products) {
    const variant = product.variants.find((item) => item.id === id);
    if (variant) return variant.id;
  }
  const product = products.find((item) => item.id === id);
  return product?.variants[0]?.id ?? null;
}

export function isGiftLine(id: string) {
  return id.startsWith("oli-gift:") || id.includes(":gift:");
}

export function storefrontLines(products: CatalogProduct[], items: { id: string; qty: number }[]): { ok: true; lines: StoreLine[] } | { ok: false } {
  const lines: StoreLine[] = [];
  for (const item of items) {
    if (isGiftLine(item.id)) continue;
    const bundle = /^(.+):x(\d+)$/.exec(item.id);
    const baseId = bundle?.[1] ?? item.id;
    const bundleQty = bundle ? Number(bundle[2]) : 1;
    if (!Number.isInteger(bundleQty) || bundleQty < 1) return { ok: false };
    const variantId = variantForLine(products, baseId);
    if (!variantId) return { ok: false };
    const quantity = bundleQty * item.qty;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 9999) return { ok: false };
    const found = lines.find((line) => line.variantId === variantId);
    if (found) found.quantity += quantity;
    else lines.push({ variantId, quantity });
  }
  return { ok: true, lines };
}
