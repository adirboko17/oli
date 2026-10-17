export type CatalogVariant = {
  id: string;
  title: string;
  sku: string | null;
  price: number | null;
  position: number;
};

export type CatalogMedia = {
  id: string;
  position: number;
  src: string | null;
  kind: "image" | "video";
};

export type CatalogBundle = { qty: number; price: number; label: string };

export type CatalogPage = {
  panels: { title: string; paras: string[] }[];
  stories: { handle: string; url: string }[];
  steps: { title: string; body: string }[];
  ingredientsIntro: string;
  ingredients: { en: string; he: string; body: string }[];
  reviews: { name: string; title: string; body: string; initial: string; meta: string }[];
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
  page: CatalogPage;
};

export function emptyCatalogPage(): CatalogPage {
  return { panels: [], stories: [], steps: [], ingredientsIntro: "", ingredients: [], reviews: [] };
}

export type PublicCatalog = {
  name: string;
  hostname: string;
  products: CatalogProduct[];
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

export function productBlurb(product: CatalogProduct) {
  const line = product.description.split("\n").map((part) => part.trim()).find(Boolean);
  return product.category || line || product.vendor;
}
