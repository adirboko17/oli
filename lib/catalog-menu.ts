import { categoryLabel, type CatalogCollection, type CatalogProduct } from "@/lib/catalog-model";

const subcategoryTagPrefix = "\u0001sub:";

export type CatalogMenuItem = {
  id: string;
  label: string;
  count: number;
  blurb: string;
};

export function isOliminiCategory(value: string) {
  const key = decodeURIComponent(value).trim();
  return key === "olimini" || key === "baby" || /^oli\s*mini$/i.test(key) || key === "תינוקות · olimini";
}

export function menuHref(id: string) {
  if (isOliminiCategory(id)) return "/olimini";
  return "/products?cat=" + encodeURIComponent(id);
}

function subcategoryNames(product: CatalogProduct) {
  return product.tags.flatMap((tag) => {
    if (!tag.startsWith(subcategoryTagPrefix)) return [];
    const name = tag.slice(subcategoryTagPrefix.length).trim();
    return name ? [name] : [];
  });
}

const OLIMINI_ITEM: CatalogMenuItem = { id: "olimini", label: "תינוקות · olimini", count: 3, blurb: "קו הטיפוח הראשון שלנו לתינוקות." };

export function catalogMenu(products: CatalogProduct[], collections: CatalogCollection[]): CatalogMenuItem[] {
  const known = new Set(products.map((product) => product.id));
  const items: CatalogMenuItem[] = [];
  collections.forEach((collection) => {
    const title = collection.title.trim();
    if (!title || isOliminiCategory(title)) return;
    const ids = new Set(collection.productIds.filter((id) => known.has(id)));
    items.push({ id: title, label: title, count: ids.size, blurb: collection.description.trim() });
    collection.subcategories.forEach((name) => {
      const count = products.filter((product) => ids.has(product.id) && subcategoryNames(product).includes(name)).length;
      items.push({ id: `${title}/${name}`, label: `${title} · ${name}`, count, blurb: "" });
    });
  });
  items.push(OLIMINI_ITEM);
  return items;
}

export function productMenuTarget(product: CatalogProduct, collections: CatalogCollection[]) {
  if (isOliminiCategory(product.category)) return { href: menuHref("olimini"), label: OLIMINI_ITEM.label };
  const collection = collections.find((item) => !isOliminiCategory(item.title) && item.productIds.includes(product.id));
  const title = collection?.title.trim() || product.category.trim();
  if (!title) return null;
  return { href: menuHref(title), label: categoryLabel(title) };
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
    return products.filter((product) => ids.has(product.id) && subcategoryNames(product).includes(name));
  }
  const collection = collections.find((item) => item.title.trim() === key);
  if (collection) {
    const memberIds = collection.productIds;
    const ordered = collection.manualSort ? memberIds : [];
    const ids = new Set(memberIds);
    const matched = products.filter((product) => ids.has(product.id));
    if (!ordered.length) return matched;
    const rank = new Map(ordered.map((id, index) => [id, index]));
    return matched
      .map((product, index) => ({ product, index, rank: rank.get(product.id) ?? Number.MAX_SAFE_INTEGER }))
      .sort((a, b) => a.rank - b.rank || a.index - b.index)
      .map((item) => item.product);
  }
  return products.filter((product) => product.category.trim() === key);
}
