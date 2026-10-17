import { notFound } from "next/navigation";
import { FF } from "@/lib/format";

type JournalArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  image: string;
  category: string;
};

// מאמר חדש: id קבוע באנגלית, ושדות title, excerpt, body, image, category.
const articles: JournalArticle[] = [];

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  if (!article) notFound();
  return (
    <article data-cms="article" data-cms-id={article.id} dir="rtl" style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(28px,5vw,56px) clamp(16px,4.5vw,32px) clamp(56px,9vw,96px)", display: "flex", flexDirection: "column", gap: 16 }}>
      {article.image ? <img src={article.image} alt="" style={{ width: "100%", borderRadius: 16 }} /> : null}
      <p style={{ fontSize: 13, color: "#8A6C64" }}>{article.category}</p>
      <h1 style={{ fontFamily: FF, fontWeight: 400, fontSize: "clamp(36px,6vw,60px)", lineHeight: 1.05 }}>{article.title}</h1>
      <p style={{ fontSize: 18, lineHeight: 1.6, color: "#5E4844" }}>{article.excerpt}</p>
      <div style={{ fontSize: 16, lineHeight: 1.8, color: "#4E3B37", whiteSpace: "pre-wrap" }}>{article.body}</div>
    </article>
  );
}
