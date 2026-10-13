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
};

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
  return product.media.find((item) => item.src)?.src ?? null;
}

export function productBlurb(product: CatalogProduct) {
  const line = product.description.split("\n").map((part) => part.trim()).find(Boolean);
  return product.category || line || product.vendor;
}
