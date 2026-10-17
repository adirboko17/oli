import { notFound } from "next/navigation";
import { ProductView } from "@/components/product-view";
import { loadPublicCatalog } from "@/lib/catalog";
import { findCatalogProduct } from "@/lib/catalog-model";

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const result = await loadPublicCatalog();
  if (result.status !== "ready") notFound();
  const product = findCatalogProduct(result.catalog.products, handle);
  if (!product) notFound();
  const related = result.catalog.products.filter((item) => item.id !== product.id);
  return (
    <div data-cms="product" data-cms-id="product" style={{ display: "contents" }}>
      <ProductView product={product} related={related} />
    </div>
  );
}
