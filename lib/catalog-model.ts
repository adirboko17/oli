import { fmt } from "@/lib/format";

export type CatalogVariant = {
  id: string;
  title: string;
  sku: string | null;
  price: number | null;
  position: number;
  stock: number;
  tracked: boolean;
};

export type CatalogMedia = {
  id: string;
  position: number;
  src: string | null;
  kind: "image" | "video";
};

export type CatalogBundle = { qty: number; price: number; label: string; image?: string; tag?: string };
export type CatalogFaq = { q: string; a: string; tag: string };

export type CatalogPage = {
  highlights: string[];
  panels: { title: string; paras: string[]; align: "right" | "left"; links: { kind: "url" | "article"; label: string; href: string }[] }[];
  stories: { handle: string; url: string }[];
  steps: { title: string; body: string }[];
  ingredientsIntro: string;
  ingredients: { en: string; he: string; body: string }[];
  inci: { inci: string; he: string; key?: boolean }[];
  reviews: { name: string; title: string; body: string; initial: string; date: string; rating: number; verified: boolean }[];
};

export type CatalogProduct = {
  id: string;
  title: string;
  handle: string | null;
  description: string;
  vendor: string;
  category: string;
  price: number;
  compareAt: number | null;
  tags: string[];
  variants: CatalogVariant[];
  media: CatalogMedia[];
  bundles: CatalogBundle[];
  faq: CatalogFaq[];
  page: CatalogPage;
  badge: string;
  badgeHidden: boolean;
  headline: { mode: "single" | "split"; subtitle: string };
  seoTitle: string;
  seoDescription: string;
  tracked: boolean;
  stock: number;
};

export function emptyCatalogPage(): CatalogPage {
  return { highlights: [], panels: [], stories: [], steps: [], ingredientsIntro: "", ingredients: [], inci: [], reviews: [] };
}

export type CatalogCollection = {
  id: string;
  title: string;
  description: string;
  productIds: string[];
  subcategories: string[];
  manualSort: boolean;
};

export type PublicCatalog = {
  name: string;
  hostname: string;
  products: CatalogProduct[];
  collections: CatalogCollection[];
};

export function productHref(product: Pick<CatalogProduct, "id" | "handle">) {
  return "/product/" + encodeURIComponent(product.handle || product.id);
}

export function findCatalogProduct(products: CatalogProduct[], handle: string) {
  const key = decodeURIComponent(handle);
  return products.find((product) => product.handle === key || product.id === key) ?? null;
}

export function categoryLabel(category: string) {
  return /^oli\s*mini$/i.test(category.trim()) ? "תינוקות · olimini" : category;
}

export const OPEN_GIFT_TAG = "\u0001gift:open";
export const GIFT_AMOUNT_PREFIX = "\u0001gift:amt:";
export const OPEN_GIFT_MIN = 150;
export const OPEN_GIFT_MAX = 2500;

export function openGiftMax(tags: string[]) {
  return tags.includes(OPEN_GIFT_TAG) ? OPEN_GIFT_MAX : null;
}

export function giftPriceLabel(product: Pick<CatalogProduct, "tags">) {
  const amounts = giftAmountsFromTags(product.tags);
  if (amounts.length) return `החל מ־${fmt(amounts[0])}`;
  const max = openGiftMax(product.tags);
  return max == null ? null : `עד ${fmt(max)}`;
}

export function giftQueryAmount(raw: string | null | undefined, amounts: number[], max: number | null): { pick: number | "custom"; text: string } | null {
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  const amount = Math.round(value * 100) / 100;
  if (amounts.includes(amount)) return { pick: amount, text: "" };
  if (max != null && amount >= OPEN_GIFT_MIN && amount <= max) return { pick: "custom", text: String(amount) };
  return null;
}

export function giftAmountsFromTags(tags: string[]) {
  const amounts: number[] = [];
  tags.forEach((tag) => {
    if (!tag.startsWith(GIFT_AMOUNT_PREFIX)) return;
    const value = Number(tag.slice(GIFT_AMOUNT_PREFIX.length));
    if (value >= OPEN_GIFT_MIN && value <= 1_000_000) amounts.push(Math.round(value * 100) / 100);
  });
  return [...new Set(amounts)].sort((a, b) => a - b);
}

export function customerTags(tags: string[]) {
  return tags.filter((tag) => tag.trim() && !tag.startsWith("\u0001"));
}

export function categoryGroups(products: CatalogProduct[]) {
  const counts = new Map<string, number>();
  for (const product of products) {
    const category = product.category.trim();
    if (!category) continue;
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  return [...counts.entries()].map(([key, count]) => ({ key, count }));
}

export function productImage(product: CatalogProduct) {
  return product.media.find((item) => item.src && item.kind !== "video")?.src ?? null;
}

export function productBadges(product: Pick<CatalogProduct, "badge" | "badgeHidden" | "compareAt" | "price">) {
  if (product.badgeHidden) return [];
  const labels: string[] = [];
  const custom = product.badge.trim();
  if (custom) labels.push(custom);
  if (product.compareAt != null && product.compareAt > product.price && !labels.includes("מבצע")) labels.push("מבצע");
  return labels;
}

export function paragraphs(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .split(/\n[ \t]*\n/)
    .map((part) => part.replace(/[ \t]+$/gm, "").replace(/^\n+|\n+$/g, ""))
    .filter((part) => part.trim());
}

export function productBlurb(product: CatalogProduct) {
  const line = product.description.split("\n").map((part) => part.trim()).find(Boolean);
  return product.category || line || product.vendor;
}

export function productSoldOut(product: Pick<CatalogProduct, "tracked" | "stock">) {
  return product.tracked && product.stock <= 0;
}

export function cappedCartQty(product: Pick<CatalogProduct, "tracked" | "stock"> | null, id: string, qty: number) {
  const wanted = Math.max(0, Math.floor(qty));
  if (!product?.tracked) return wanted;
  const pack = Number(/:x(\d+)$/.exec(id)?.[1] ?? 1);
  const size = Number.isInteger(pack) && pack > 0 ? pack : 1;
  return Math.min(wanted, Math.floor(Math.max(0, product.stock) / size));
}

export function findCartProduct(products: CatalogProduct[], id: string) {
  const base = id.split(":")[0] ?? id;
  return products.find((product) => product.id === base || product.variants.some((variant) => variant.id === base)) ?? null;
}

export function productCardSub(product: CatalogProduct) {
  if (product.headline.mode === "split" && product.headline.subtitle.trim()) return product.headline.subtitle.trim();
  return productBlurb(product);
}
