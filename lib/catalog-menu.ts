import type { CatalogCollection, CatalogProduct } from "@/lib/catalog-model";

const subcategoryTagPrefix = "\u0001sub:";

export type CatalogMenuItem = {
  id: string;
  label: string;
  count: number;
  blurb: string;
};

type Bucket = {
  ids: Set<string>;
  subs: string[];
  blurb: string;
};

export function menuHref(id: string) {
  return "/products?cat=" + encodeURIComponent(id);
}

function subcategoryNames(product: CatalogProduct) {
  return product.tags.flatMap((tag) => {
    if (!tag.startsWith(subcategoryTagPrefix)) return [];
    const name = tag.slice(subcategoryTagPrefix.length).trim();
    return name ? [name] : [];
  });
}

function bucketFor(groups: Map<string, Bucket>, title: string) {
  const current = groups.get(title);
  if (current) return current;
  const created: Bucket = { ids: new Set(), subs: [], blurb: "" };
  groups.set(title, created);
  return created;
}

export function catalogMenu(products: CatalogProduct[], collections: CatalogCollection[]): CatalogMenuItem[] {
  const groups = new Map<string, Bucket>();
  products.forEach((product) => {
    const title = product.category.trim();
    if (!title) return;
    bucketFor(groups, title).ids.add(product.id);
  });
  collections.forEach((collection) => {
    const title = collection.title.trim();
    if (!title) return;
    const bucket = bucketFor(groups, title);
    collection.productIds.forEach((id) => bucket.ids.add(id));
    if (!bucket.blurb && collection.description.trim()) bucket.blurb = collection.description.trim();
    collection.subcategories.forEach((name) => {
      if (!bucket.subs.includes(name)) bucket.subs.push(name);
    });
  });
  products.forEach((product) => {
    const title = product.category.trim();
    if (!title || !groups.has(title)) return;
    const bucket = groups.get(title)!;
    subcategoryNames(product).forEach((name) => {
      if (!bucket.subs.includes(name)) bucket.subs.push(name);
    });
  });

  const items: CatalogMenuItem[] = [];
  const known = new Set(products.map((product) => product.id));
  const titles = [
    ...collections.flatMap((collection) => {
      const title = collection.title.trim();
      return title && groups.has(title) ? [title] : [];
    }),
    ...[...groups.keys()].filter((title) => !collections.some((collection) => collection.title.trim() === title)),
  ];
  titles.forEach((title) => {
    const bucket = groups.get(title)!;
    const count = [...bucket.ids].filter((id) => known.has(id)).length;
    items.push({ id: title, label: title, count, blurb: bucket.blurb });
    bucket.subs.forEach((name) => {
      const count = products.filter((product) => subcategoryNames(product).includes(name) && (product.category.trim() === title || bucket.ids.has(product.id))).length;
      items.push({ id: `${title}/${name}`, label: `${title} · ${name}`, count, blurb: "" });
    });
  });
  return items;
}

export function findMenuItem(items: CatalogMenuItem[], key: string) {
  const value = decodeURIComponent(key);
  return items.find((item) => item.id === value || item.label === value) ?? null;
}

export function productsForMenu(products: CatalogProduct[], collections: CatalogCollection[], key: string) {
  if (!key || key === "all") return products;
  const slash = key.indexOf("/");
  if (slash > 0) {
    const parent = key.slice(0, slash);
    const name = key.slice(slash + 1);
    const ids = new Set(collections.find((collection) => collection.title.trim() === parent)?.productIds ?? []);
    return products.filter((product) => subcategoryNames(product).includes(name) && (product.category.trim() === parent || ids.has(product.id)));
  }
  const ids = new Set(collections.find((collection) => collection.title.trim() === key)?.productIds ?? []);
  return products.filter((product) => product.category.trim() === key || ids.has(product.id));
}
