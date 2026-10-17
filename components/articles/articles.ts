import journal from "@/lib/journal.json";

export type CategoryKey = "preg" | "skin" | "birth" | "post" | "baby";

export const CATEGORIES: Record<"all" | CategoryKey, string> = {
  all: "כל המאמרים",
  preg: "הריון",
  skin: "טיפוח העור בהריון",
  birth: "לידה והכנה ללידה",
  post: "אחרי לידה",
  baby: "תינוקות והורות ראשונית",
};

export const CATEGORY_TINT: Record<CategoryKey, string> = {
  preg: "#F3D9C6",
  skin: "#F8EFE9",
  birth: "#EAD9CC",
  post: "#F6E6DA",
  baby: "#EFE4DC",
};

export const CATEGORY_PRODUCT: Record<CategoryKey, string> = {
  preg: "olilax",
  skin: "olilastic",
  birth: "olineum",
  post: "nippoli",
  baby: "bestof",
};

export type Block =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: { term: string; text: string }[] };

export type Article = {
  id: string;
  slug: string;
  title: string;
  category: CategoryKey;
  image?: string;
  author?: string;
  updated?: string;
  lead?: string;
  productId?: string;
  productNote?: string;
  body?: Block[];
};

const DESIGN_CATEGORY: CategoryKey[] = [
  "skin", "birth", "preg", "birth", "post", "post", "skin", "skin", "preg", "skin",
  "post", "post", "birth", "post", "preg", "birth", "baby", "birth", "baby", "post",
  "preg", "baby", "baby", "preg", "birth", "post", "preg", "preg", "post", "birth",
  "preg", "baby", "baby", "preg", "birth", "preg", "preg", "preg", "birth", "birth",
  "baby", "preg", "baby", "preg", "preg", "preg", "preg", "birth", "birth", "skin",
  "skin", "baby",
];

function isAuthor(line: string) {
  return line.length < 140 && /מיילדת|גינקולוג|פיזיותרפ|מנהל מחלק|מנהל החטיב|רופא|נטע צמח|אלינה /.test(line) && !line.endsWith("?");
}

function isHeading(line: string) {
  if (line.length > 80 || line.endsWith(".") || line.endsWith("!")) return false;
  if (line.endsWith("?")) return true;
  return line.length <= 48 && !line.includes(":") && line.split(" ").length <= 8;
}

function blocksFrom(text: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { term: string; text: string }[] | null = null;
  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  };
  const flushList = () => {
    if (list?.length) blocks.push({ type: "list", items: list });
    list = null;
  };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    if (/^[•\-]\s/.test(line) || /^\d+\.\s/.test(line)) {
      flushParagraph();
      if (!list) list = [];
      const stripped = line.replace(/^[•\-]\s*/, "").replace(/^\d+\.\s*/, "");
      const dot = stripped.indexOf(". ");
      if (dot > 0 && dot < 42) list.push({ term: stripped.slice(0, dot + 1), text: stripped.slice(dot + 2) });
      else list.push({ term: stripped, text: "" });
      continue;
    }
    flushList();
    if (isHeading(line)) {
      flushParagraph();
      blocks.push({ type: "heading", text: line });
    } else paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}

function present(raw: (typeof journal)[number], index: number): Article {
  const lines = raw.body.split("\n").map((line) => line.trim());
  let cursor = 0;
  const lead: string[] = [];
  while (cursor < lines.length && lines[cursor] && !lines[cursor].startsWith("עודכן") && !isAuthor(lines[cursor]) && !isHeading(lines[cursor])) {
    lead.push(lines[cursor]);
    cursor += 1;
  }
  let author = "";
  let updated = "";
  while (cursor < lines.length && (!lines[cursor] || lines[cursor].startsWith("עודכן") || isAuthor(lines[cursor]))) {
    if (lines[cursor].startsWith("עודכן")) updated = lines[cursor].replace(/^עודכן:\s*/, "");
    else if (lines[cursor]) author = author ? author + " · " + lines[cursor] : lines[cursor];
    cursor += 1;
  }
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    category: DESIGN_CATEGORY[index] || "skin",
    image: raw.image || undefined,
    author: author || undefined,
    updated: updated || undefined,
    lead: lead.join(" ") || raw.excerpt,
    body: blocksFrom(lines.slice(cursor).join("\n")),
  };
}

export const ARTICLES: Article[] = journal.map(present);

export const getArticle = (slug: string) => ARTICLES.find((article) => article.slug === decodeURIComponent(slug));
export const articleNumber = (article: Article) => String(ARTICLES.indexOf(article) + 1).padStart(2, "0");
export const relatedArticles = (article: Article, count: number) => ARTICLES.filter((item) => item.category === article.category && item !== article).slice(0, count);
