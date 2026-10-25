"use client";

import { productBlurb, productHref, productImage, type CatalogProduct } from "@/lib/catalog-model";
import { fmt } from "@/lib/format";
import { useSite } from "@/components/site";
import OliminiPage, { type MiniProduct } from "./OliminiPage";
import type { ToGoProduct } from "./OliminiToGo";

const LINE = [
  { handle: "babypre", test: /pre\s*(&|and)?\s*shower|מרקם רחצה/i, name: "Pre & Shower Ritual", sub: "מרקם רחצה לתינוקות", price: 69, image: "/assets/olimini-pre-cut.png" },
  { handle: "babyafter", test: /after shower/i, name: "After Shower Ritual", sub: "קרם לחות לתינוק", price: 69, image: "/assets/olimini-after-cut.png" },
  { handle: "babyspa", test: /baby spa|spa ritual/i, name: "Baby Spa Ritual", sub: "קרם עיסוי לתינוק", price: 59, old: 74, image: "/assets/olimini-spa-cut.png" },
];

const TO_GO: (ToGoProduct & { test: RegExp })[] = [
  { id: "togo-pre", name: "Pre & Shower To Go", size: "50 מ״ל", price: 39, image: "/assets/olimini-pre-cut.png", test: /pre[\s&]*shower.*to\s*go|to\s*go.*pre[\s&]*shower/i },
  { id: "togo-after", name: "After Shower To Go", size: "50 מ״ל", price: 39, image: "/assets/olimini-after-cut.png", test: /after\s*shower.*to\s*go|to\s*go.*after\s*shower/i },
  { id: "togo-spa", name: "Baby Spa To Go", size: "50 מ״ל", price: 45, image: "/assets/olimini-spa-cut.png", test: /baby\s*spa.*to\s*go|to\s*go.*baby\s*spa/i },
];

function toGoProducts(products: CatalogProduct[]): ToGoProduct[] {
  return TO_GO.map((item) => {
    const match = products.find((product) => item.test.test(`${product.title} ${product.handle ?? ""}`));
    return { id: match?.id ?? item.id, name: match?.title ?? item.name, size: item.size, price: match?.price ?? item.price, image: item.image };
  });
}

function matchProduct(products: CatalogProduct[], handle: string, test: RegExp) {
  return products.find((product) => product.handle === handle || product.id === handle || test.test(`${product.title} ${product.handle}`)) ?? null;
}

export function oliminiProducts(products: CatalogProduct[]): MiniProduct[] {
  return LINE.map((item) => {
    const match = matchProduct(products, item.handle, item.test);
    const old = match ? (match.compareAt != null && match.compareAt > match.price ? match.compareAt : undefined) : item.old;
    return {
      id: match?.id ?? item.handle,
      name: match?.title ?? item.name,
      sub: match ? productBlurb(match) : item.sub,
      price: match?.price ?? item.price,
      oldPrice: old,
      image: item.image,
      href: match ? productHref(match) : "/olimini",
    };
  });
}

export function OliminiView() {
  const { products, add } = useSite();
  const lineup = oliminiProducts(products);
  const toGo = toGoProducts(products);
  const addProduct = (id: string) => {
    const product = products.find((item) => item.id === id || item.handle === id);
    if (!product) return;
    add({ id: product.id, name: product.title, sub: productBlurb(product), price: product.price, image: productImage(product) });
  };
  return (
    <OliminiPage
      products={lineup}
      toGo={toGo}
      formatPrice={fmt}
      onAdd={addProduct}
      onAddToGo={(item) => addProduct(item.id)}
    />
  );
}
