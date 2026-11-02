"use client";

import { CatalogCard } from "@/components/cards";
import { productBlurb, productCardSub, productHref, productImage, productSoldOut, type CatalogProduct } from "@/lib/catalog-model";
import { fmt } from "@/lib/format";
import { oliminiGroups, shelfLine } from "@/lib/olimini-kits";
import { useSite } from "@/components/site";
import OliminiPage, { type MiniProduct } from "./OliminiPage";
import type { ToGoProduct } from "./OliminiToGo";

export { oliminiShelfProducts } from "@/lib/olimini-kits";

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
  const { main, toGo, related } = oliminiGroups(products, collections);
  const addProduct = (id: string) => {
    const product = products.find((item) => item.id === id);
    if (!product) return;
    add({ id: product.id, name: product.title, sub: productBlurb(product), price: product.price, image: productImage(product) });
  };
  return (
    <OliminiPage
      shelf={shelfLine(main).map(toMini)}
      products={main.map(toMini)}
      toGo={toGo.map(toGoCard)}
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
