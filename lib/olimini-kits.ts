import type { CatalogCollection, CatalogProduct } from "@/lib/catalog-model";
import { shippingAfterFreeThreshold } from "@/lib/shipping";

export const OLIMINI_KIT_PRICE = 219;
export const OLIMINI_TOGO_PRICE = 59.9;

const subcategoryTagPrefix = "\u0001sub:";

function subcategoryNames(product: CatalogProduct) {
  return product.tags.flatMap((tag) => {
    if (!tag.startsWith(subcategoryTagPrefix)) return [];
    const name = tag.slice(subcategoryTagPrefix.length).trim();
    return name ? [name] : [];
  });
}

function isToGoName(name: string) {
  return /to\s*-?\s*go|togo/i.test(name.trim());
}

function oliminiCollection(collections: CatalogCollection[]) {
  return collections.find((collection) => /olimini/i.test(collection.title)) ?? null;
}

function orderedMembers(products: CatalogProduct[], ids: string[]) {
  const rank = new Map(ids.map((id, index) => [id, index]));
  return products
    .filter((product) => rank.has(product.id))
    .sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));
}

function pageProducts(products: CatalogProduct[], collection: CatalogCollection | null) {
  const ids = collection?.productIds ?? [];
  const known = new Set(ids);
  const extra = products.filter((product) => {
    if (known.has(product.id)) return false;
    if (collection && product.category.trim() === collection.title.trim()) return true;
    return subcategoryNames(product).some((name) => isToGoName(name) || name.trim() === "תינוקות");
  });
  return [...orderedMembers(products, ids), ...extra];
}

export function shelfLine(products: CatalogProduct[]) {
  const pick = (pattern: RegExp) => products.find((product) => pattern.test(product.title));
  const placed = [pick(/spray/i), pick(/pre/i), pick(/after/i), pick(/baby\s*spa/i)].filter((product): product is CatalogProduct => Boolean(product));
  const used = new Set(placed.map((product) => product.id));
  return [...placed, ...products.filter((product) => !used.has(product.id))];
}

export function oliminiGroups(products: CatalogProduct[], collections: CatalogCollection[]) {
  const main: CatalogProduct[] = [];
  const toGo: CatalogProduct[] = [];
  const related: CatalogProduct[] = [];
  pageProducts(products, oliminiCollection(collections)).forEach((product) => {
    const names = subcategoryNames(product);
    if (names.some(isToGoName)) toGo.push(product);
    else if (names.some((name) => name.trim() === "תינוקות")) related.push(product);
    else main.push(product);
  });
  return { main, toGo, related };
}

export function oliminiShelfProducts(products: CatalogProduct[], collections: CatalogCollection[]) {
  return shelfLine(oliminiGroups(products, collections).main);
}

export function moneyRound(value: number) {
  return Math.round(value * 100) / 100;
}

function unitQty(product: CatalogProduct, items: { id: string; qty: number }[]) {
  const ids = new Set([product.id, ...product.variants.map((variant) => variant.id)]);
  return items.reduce((sum, item) => ids.has(item.id) ? sum + item.qty : sum, 0);
}

function setSavings(members: CatalogProduct[], items: { id: string; qty: number }[], dealPrice: number, required: number) {
  if (members.length !== required) return 0;
  const sets = Math.min(...members.map((product) => unitQty(product, items)));
  if (!Number.isFinite(sets) || sets < 1) return 0;
  const full = members.reduce((sum, product) => sum + product.price, 0);
  const cut = full - dealPrice;
  if (cut <= 0) return 0;
  return moneyRound(cut * sets);
}

export function oliminiBundleOffer(products: CatalogProduct[], collections: CatalogCollection[], items: { id: string; qty: number }[]) {
  const { main, toGo } = oliminiGroups(products, collections);
  const kit = setSavings(main, items, OLIMINI_KIT_PRICE, 4);
  const togo = toGo.length >= 2 ? setSavings(toGo, items, OLIMINI_TOGO_PRICE, toGo.length) : 0;
  const parts = [
    kit > 0 ? { label: "חבילת olimini", amount: kit } : null,
    togo > 0 ? { label: "Olimini To Go", amount: togo } : null,
  ].filter((part): part is { label: string; amount: number } => Boolean(part));
  return { amount: moneyRound(parts.reduce((sum, part) => sum + part.amount, 0)), label: parts.map((part) => part.label).join(" · "), parts };
}

export function totalAfterOliminiBundle(input: {
  merchandise: number;
  shipping: number | null;
  total: number;
  savings: number;
  saleLocked: boolean;
}) {
  const merchandise = moneyRound(input.merchandise - input.savings);
  const total = moneyRound(input.total - input.savings);
  if (input.saleLocked) return { merchandise, shipping: input.shipping, total };
  const waived = shippingAfterFreeThreshold(merchandise, input.shipping, total);
  return { merchandise, shipping: waived.shipping, total: waived.total };
}
