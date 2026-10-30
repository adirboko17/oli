"use client";

import { productBlurb, productImage, productSoldOut } from "@/lib/catalog-model";
import { useSite } from "@/components/site";

export function AddToCart({ productId, className }: { productId: string; className?: string }) {
  const site = useSite();
  const product = site.products.find((item) => item.id === productId);
  if (!product) return null;
  const soldOut = productSoldOut(product);
  return (
    <button
      type="button"
      className={className}
      disabled={soldOut}
      onClick={() => {
        if (soldOut) return;
        site.add({
          id: product.id,
          name: product.title,
          sub: productBlurb(product),
          price: product.price,
          image: productImage(product),
        });
      }}
    >
      {soldOut ? "אזל מהמלאי" : "הוספה לסל"}
    </button>
  );
}
