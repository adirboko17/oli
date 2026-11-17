import { headers } from "next/headers";
import ArticlesIndex from "@/components/articles/ArticlesIndex";
import { ARTICLES, articleFromShop, type Article, type CategoryKey } from "@/components/articles/articles";
import { loadShopPosts } from "@/lib/storely-shop";

const KEYS = new Set(["preg", "skin", "birth", "post", "baby"]);

export const metadata = {
  title: "מאמרים",
  description: "מאמרים וטיפים להריון, ללידה ולתינוקות.",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const initialCategory = category && KEYS.has(category) ? category as CategoryKey : "all";
  const posts = await loadShopPosts((await headers()).get("host"));
  const known = new Set(ARTICLES.map((article) => article.slug));
  const extra: Article[] = [];
  for (const post of posts) {
    if (known.has(post.handle)) continue;
    const article = articleFromShop(post);
    if (article) extra.push({ ...article, body: undefined });
  }
  const media = Object.fromEntries(posts.filter((post) => post.image).map((post) => [post.handle, { image: post.image, imageX: post.imageX, imageY: post.imageY, imageScale: post.imageScale }]));
  return <ArticlesIndex initialCategory={initialCategory} media={media} articles={[...extra, ...ARTICLES]} />;
}
