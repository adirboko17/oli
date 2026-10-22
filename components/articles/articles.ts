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
  video?: string;
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
  if (!line || line.length > 180 || /[?!]$/.test(line)) return false;
  const cleaned = line.replace(/^מאת\s+/, "");
  const comma = cleaned.indexOf(",");
  if (comma < 1 || comma > 42) return false;
  const name = cleaned.slice(0, comma).trim();
  if (name.split(/\s+/).length > 6 || /[:()]/.test(name) || /^(יחד|כמו|זה|היא|הוא|אני|אנחנו|יש|אין|כך|אבל|לכן|כדי)\b/.test(name)) return false;
  return /מיילדת|גינקולוג|פיזיותרפ|מנהל|רופא|יועצ|דולה|מומח|פרופ|ד["״']ר|IBCLC|נטע צמח|אלינה /.test(cleaned);
}

function isNameLine(line: string) {
  return line.length > 1 && line.length < 40 && line.split(/\s+/).length <= 4 && !/[.?!:,]/.test(line);
}

function isRoleLine(line: string) {
  return !!line && line.length < 140 && /מיילדת|גינקולוג|פיזיותרפ|יועצ|דולה|IBCLC|מומח|מנהל/.test(line);
}

function isHeading(line: string) {
  if (line.length > 80 || line.endsWith(".") || line.endsWith("!")) return false;
  if (line.endsWith("?")) return true;
  return line.length <= 48 && !line.includes(":") && line.split(" ").length <= 8;
}

export function blocksFrom(text: string): Block[] {
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
  const nameBeforeRole = (index: number) => {
    let next = index + 1;
    while (next < lines.length && !lines[next]) next += 1;
    return isNameLine(lines[index]) && isRoleLine(lines[next]);
  };
  while (cursor < lines.length && lines[cursor] && !lines[cursor].startsWith("עודכן") && !isAuthor(lines[cursor]) && !nameBeforeRole(cursor) && !isHeading(lines[cursor])) {
    lead.push(lines[cursor]);
    cursor += 1;
  }
  let author = "";
  let updated = "";
  while (cursor < lines.length && (!lines[cursor] || lines[cursor].startsWith("עודכן") || isAuthor(lines[cursor]) || nameBeforeRole(cursor))) {
    if (lines[cursor].startsWith("עודכן")) updated = lines[cursor].replace(/^עודכן:\s*/, "");
    else if (nameBeforeRole(cursor)) {
      let role = cursor + 1;
      while (role < lines.length && !lines[role]) role += 1;
      const combined = lines[cursor] + ", " + lines[role].replace(/\.$/, "");
      author = author ? author + " · " + combined : combined;
      cursor = role;
    } else if (lines[cursor]) author = author ? author + " · " + lines[cursor] : lines[cursor];
    cursor += 1;
  }
  if (!author) {
    for (let scan = cursor; scan < lines.length; scan += 1) {
      if (!lines[scan].startsWith("עודכן")) continue;
      let byline = scan + 1;
      while (byline < lines.length && !lines[byline]) byline += 1;
      if (!isAuthor(lines[byline]) && !nameBeforeRole(byline)) continue;
      updated = updated || lines[scan].replace(/^עודכן:\s*/, "");
      lines[scan] = "";
      if (nameBeforeRole(byline)) {
        let role = byline + 1;
        while (role < lines.length && !lines[role]) role += 1;
        author = lines[byline] + ", " + lines[role].replace(/\.$/, "");
        lines[byline] = "";
        lines[role] = "";
      } else {
        author = lines[byline];
        lines[byline] = "";
      }
      break;
    }
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

export function authorNames(author?: string) {
  if (!author) return "";
  return author
    .split(" · ")
    .map((part) => part.replace(/^מאת\s+/, "").split(",")[0].replace(/\b(MN|RN|IBCLC)\b/g, "").replace(/[.\s]+$/, "").replace(/\s{2,}/g, " ").trim())
    .filter(Boolean)
    .join(" · ");
}

export const getArticle = (slug: string) => ARTICLES.find((article) => article.slug === decodeURIComponent(slug));
export const articleNumber = (article: Article) => String(ARTICLES.indexOf(article) + 1).padStart(2, "0");
export const relatedArticles = (article: Article, count: number) => ARTICLES.filter((item) => item.category === article.category && item !== article).slice(0, count);
