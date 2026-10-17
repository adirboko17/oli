import articlesJson from "@/lib/journal.json";

export type JournalArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  image: string;
  category: string;
};

export const articles = articlesJson as JournalArticle[];

export function findArticle(slug: string) {
  return articles.find((article) => article.slug === slug) ?? null;
}
