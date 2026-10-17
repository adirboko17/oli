"use client";

import { productBlurb, productHref, productImage, type CatalogProduct } from "@/lib/catalog-model";
import { fmt } from "@/lib/format";
import { useSite } from "@/components/site";
import OliminiPage, { type MiniProduct } from "./OliminiPage";

const LINE = [
  { handle: "babypre", test: /pre\s*(&|and)?\s*shower|מרקם רחצה/i, name: "Pre & Shower Ritual", sub: "מרקם רחצה לתינוקות", price: 69, image: "/assets/olimini-pre-cut.png" },
  { handle: "babyafter", test: /after shower/i, name: "After Shower Ritual", sub: "קרם לחות לתינוק", price: 69, image: "/assets/olimini-after-cut.png" },
  { handle: "babyspa", test: /baby spa|spa ritual/i, name: "Baby Spa Ritual", sub: "קרם עיסוי לתינוק", price: 59, old: 74, image: "/assets/olimini-spa-cut.png" },
];

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
  return (
    <OliminiPage
      products={lineup}
      formatPrice={fmt}
      onAdd={(id) => {
        const product = products.find((item) => item.id === id || item.handle === id);
        if (!product) return;
        add({ id: product.id, name: product.title, sub: productBlurb(product), price: product.price, image: productImage(product) });
      }}
    />
  );
}
