import { notFound } from "next/navigation";
import { ProductView } from "@/components/product-view";
import { loadPublicCatalog } from "@/lib/catalog";
import { findCatalogProduct } from "@/lib/catalog-model";

export default async function Page({ params, searchParams }: { params: Promise<{ handle: string }>; searchParams: Promise<{ amount?: string | string[] }> }) {
  const { handle } = await params;
  const query = await searchParams;
  const amount = Array.isArray(query.amount) ? query.amount[0] : query.amount;
  const result = await loadPublicCatalog();
  if (result.status !== "ready") notFound();
  const product = findCatalogProduct(result.catalog.products, handle);
  if (!product) notFound();
  const related = result.catalog.products.filter((item) => item.id !== product.id);
  return (
    <div data-cms="product" data-cms-id="product" style={{ display: "contents" }}>
      <ProductView key={`${product.id}:${amount ?? ""}`} product={product} related={related} initialGiftAmount={amount} />
    </div>
  );
}
