"use client";

import { CatalogCard } from "@/components/cards";
import { productBlurb, productCardSub, productHref, productImage, productSoldOut, type CatalogCollection, type CatalogProduct } from "@/lib/catalog-model";
import { fmt } from "@/lib/format";
import { useSite } from "@/components/site";
import OliminiPage, { type MiniProduct } from "./OliminiPage";
import type { ToGoProduct } from "./OliminiToGo";

const LINE = [
  { handle: "babypre", test: /pre\s*(&|and)?\s*shower|מרקם רחצה/i, name: "Pre & Shower Ritual", sub: "מרקם רחצה לתינוקות", price: 69, image: "/assets/olimini-pre-cut.png" },
  { handle: "babyafter", test: /after shower/i, name: "After Shower Ritual", sub: "קרם לחות לתינוק", price: 69, image: "/assets/olimini-after-cut.png" },
  { handle: "babyspa", test: /baby spa|spa ritual/i, name: "Baby Spa Ritual", sub: "קרם עיסוי לתינוק", price: 59, old: 74, image: "/assets/olimini-spa-cut.png" },
];

const subcategoryTagPrefix = "\u0001sub:";

function matchProduct(products: CatalogProduct[], handle: string, test: RegExp) {
  return products.find((product) => product.handle === handle || product.id === handle || test.test(`${product.title} ${product.handle ?? ""}`)) ?? null;
}

function openingShelf(products: CatalogProduct[]): MiniProduct[] {
  return LINE.map((item) => {
    const match = matchProduct(products, item.handle, item.test);
    const old = match ? (match.compareAt != null && match.compareAt > match.price ? match.compareAt : undefined) : item.old;
    return {
      id: match?.id ?? item.handle,
      name: match?.title ?? item.name,
      sub: match ? productCardSub(match) : item.sub,
      price: match?.price ?? item.price,
      oldPrice: old,
      image: item.image,
      href: match ? productHref(match) : "/olimini",
    };
  });
}

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

function sizeLabel(product: CatalogProduct) {
  const title = product.variants[0]?.title.trim() ?? "";
  if (!title || title === "Default Title" || title === product.title) return "";
  return title;
}

function toMini(product: CatalogProduct): MiniProduct {
  const old = product.compareAt != null && product.compareAt > product.price ? product.compareAt : undefined;
  return {
    id: product.id,
    name: product.title,
    sub: productCardSub(product),
    price: product.price,
    oldPrice: old,
    image: productImage(product) ?? "",
    href: productHref(product),
    soldOut: productSoldOut(product),
  };
}

function toGoCard(product: CatalogProduct): ToGoProduct {
  return {
    id: product.id,
    name: product.title,
    size: sizeLabel(product),
    price: product.price,
    image: productImage(product) ?? "",
    href: productHref(product),
    soldOut: productSoldOut(product),
  };
}

export function OliminiView() {
  const { products, collections, add } = useSite();
  const collection = oliminiCollection(collections);
  const members = pageProducts(products, collection);
  const toGo: ToGoProduct[] = [];
  const related: CatalogProduct[] = [];
  const main: CatalogProduct[] = [];
  members.forEach((product) => {
    const names = subcategoryNames(product);
    if (names.some(isToGoName)) toGo.push(toGoCard(product));
    else if (names.some((name) => name.trim() === "תינוקות")) related.push(product);
    else main.push(product);
  });
  const addProduct = (id: string) => {
    const product = products.find((item) => item.id === id);
    if (!product) return;
    add({ id: product.id, name: product.title, sub: productBlurb(product), price: product.price, image: productImage(product) });
  };
  return (
    <OliminiPage
      shelf={openingShelf(products)}
      products={main.map(toMini)}
      toGo={toGo}
      related={related.length ? (
        <section className="om-related">
          <h2 className="om-h2">מוצרים נלווים</h2>
          <div className="om-related__grid">
            {related.map((product) => <CatalogCard key={product.id} p={product} />)}
          </div>
        </section>
      ) : null}
      formatPrice={fmt}
      onAdd={addProduct}
      onAddToGo={(item) => addProduct(item.id)}
    />
  );
}
