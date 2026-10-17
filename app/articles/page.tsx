import ArticlesIndex from "@/components/articles/ArticlesIndex";
import type { CategoryKey } from "@/components/articles/articles";

const KEYS = new Set(["preg", "skin", "birth", "post", "baby"]);

export const metadata = {
  title: "מאמרים",
  description: "מאמרים וטיפים להריון, ללידה ולתינוקות.",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const initialCategory = category && KEYS.has(category) ? category as CategoryKey : "all";
  return <ArticlesIndex initialCategory={initialCategory} />;
}
