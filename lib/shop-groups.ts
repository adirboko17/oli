import type { CatalogProduct } from "@/lib/catalog-model";

export type ShopGroup = {
  id: string;
  label: string;
  blurb: string;
};

export const SHOP_GROUPS: ShopGroup[] = [
  { id: "best", label: "המומלצים ביותר", blurb: "המוצרים שהלקוחות שלנו חוזרות אליהם שוב ושוב." },
  { id: "preg", label: "הריון", blurb: "חמאת גוף לסימני מתיחה, שמן עיסוי, קרם לרגליים עייפות וקרם פנים, בטוחים לשימוש לאורך ההריון." },
  { id: "birth", label: "לידה ואחרי לידה", blurb: "מוצרים ללידה ולהנקה, ולשבועות הראשונים עם התינוק." },
  { id: "baby", label: "תינוקות · olimini", blurb: "קו טיפוח חדש לתינוקות, על בסיס רכיבים טבעיים ובלי סבונים, פרפום, פתלטים וחומרים משמרים." },
  { id: "gift", label: "מתנה ליולדת", blurb: "מארזים מוכנים למתנה, להריוניות וליולדות." },
];

export function groupHref(id: string) {
  return "/products?cat=" + encodeURIComponent(id);
}

export function findGroup(key: string) {
  const value = decodeURIComponent(key);
  return SHOP_GROUPS.find((group) => group.id === value || group.label === value) ?? null;
}

export function inGroup(product: CatalogProduct, id: string) {
  const text = `${product.title} ${product.category} ${product.tags.join(" ")}`.toLowerCase();
  if (id === "baby") return /oli\s*mini|olimini|תינוק|shower ritual|spa ritual|after shower/.test(text);
  if (id === "gift") return /מתנ|מארז|gift/.test(text);
  if (id === "birth") return product.category.includes("לידה") || /לידה|אחרי לידה|הנק|nipp|פטמ|olineum/.test(text);
  if (id === "preg") return product.category === "הריון" || /הריון|מתיחה|lastic|glow|olilax|שמן/.test(text);
  if (id === "best") return /best|מומלץ|הנמכר/.test(text) || /olilastic|oliglow|nippoli|olineum/i.test(product.title);
  return false;
}

export function shopGroups(products: CatalogProduct[]) {
  return SHOP_GROUPS.map((group) => ({
    ...group,
    count: products.filter((product) => inGroup(product, group.id)).length,
  }));
}

export function productsInGroup(products: CatalogProduct[], key: string) {
  if (!key || key === "all") return products;
  const group = findGroup(key);
  if (group) return products.filter((product) => inGroup(product, group.id));
  return products.filter((product) => product.category === key);
}
