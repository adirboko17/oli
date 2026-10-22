import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ArticleView from "@/components/articles/ArticleView";
import { AddToCart } from "@/components/articles/AddToCart";
import { ARTICLES, CATEGORY_PRODUCT, blocksFrom, getArticle } from "@/components/articles/articles";
import type { CalloutProduct } from "@/components/articles/ArticleView";
import { articlePublicPath } from "@/lib/article-paths";
import { loadPublicCatalog } from "@/lib/catalog";
import { loadShopPosts } from "@/lib/storely-shop";
import { productBlurb, productHref, productImage, type CatalogProduct } from "@/lib/catalog-model";
import { fmt } from "@/lib/format";

const PRODUCT_KEY: Record<string, RegExp> = {
  olilastic: /olilastic/i,
  olilax: /olilax/i,
  olineum: /olineum|oineum/i,
  nippoli: /nippoli|nipple|פטמ/i,
  bestof: /olimini|מארז/i,
};

function callout(products: CatalogProduct[], key: string): CalloutProduct | undefined {
  const test = PRODUCT_KEY[key];
  const product = test ? products.find((item) => test.test(`${item.title} ${item.handle || ""}`)) : undefined;
  if (!product) return undefined;
  return {
    id: product.id,
    name: product.title,
    sub: productBlurb(product),
    priceLabel: fmt(product.price),
    image: productImage(product) || "",
    href: productHref(product),
  };
}

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const canonical = articlePublicPath(article.slug);
  return { title: article.title, description: article.lead || article.title, alternates: canonical ? { canonical } : undefined };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const posts = await loadShopPosts((await headers()).get("host"));
  const match = posts.find((post) => post.handle === article.slug || post.handle === slug);
  const shown = {
    ...article,
    video: match?.video || article.video,
    body: match?.body.trim() ? blocksFrom(match.body) : article.body,
  };
  const result = await loadPublicCatalog();
  const products = result.status === "ready" ? result.catalog.products : [];
  const productKey = article.productId || CATEGORY_PRODUCT[article.category];
  return <ArticleView article={shown} getProduct={() => callout(products, productKey)} AddToCart={AddToCart} />;
}
