import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/product-view";
import { loadPublicCatalog } from "@/lib/catalog";
import { findCatalogProduct, productHref } from "@/lib/catalog-model";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const result = await loadPublicCatalog();
  if (result.status !== "ready") return { title: "מוצר" };
  const product = findCatalogProduct(result.catalog.products, handle);
  if (!product) return { title: "מוצר" };
  const title = product.seoTitle || product.title;
  const description = (product.seoDescription || product.description).replace(/\s+/g, " ").trim().slice(0, 160);
  const image = product.media.find((item) => item.kind === "image" && item.src)?.src ?? undefined;
  return {
    title,
    description,
    alternates: { canonical: productHref(product) },
    openGraph: { title, description, url: productHref(product), ...(image ? { images: [image] } : {}) },
  };
}

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
