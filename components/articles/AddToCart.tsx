"use client";

import { productBlurb, productImage } from "@/lib/catalog-model";
import { useSite } from "@/components/site";

export function AddToCart({ productId, className }: { productId: string; className?: string }) {
  const site = useSite();
  const product = site.products.find((item) => item.id === productId);
  if (!product) return null;
  return (
    <button
      type="button"
      className={className}
      onClick={() => site.add({
        id: product.id,
        name: product.title,
        sub: productBlurb(product),
        price: product.price,
        image: productImage(product),
      })}
    >
      הוספה לסל
    </button>
  );
}
