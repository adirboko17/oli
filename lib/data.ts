import type { CSSProperties } from "react";

const W = "https://static.wixstatic.com/media/";

export const BG = {
  peach: W + "db159b_e9bdbc308ffa4b0bb18809d1b23ec108~mv2.jpg",
  rose: W + "db159b_22360eb95c0b4d6eb40a977e9e07dabb~mv2.png",
  cream: W + "db159b_6c6b073be1574602a9937309c3cb2d29~mv2.png",
  mist: W + "db159b_7d6223d7bf6d43a7ab1e17842a1328b6~mv2.png",
} as const;

export type BgKey = keyof typeof BG;

export function img(id: string, w = 800, h = 1000) {
  return `${W}${id}/v1/fill/w_${w},h_${h},al_c,q_85,enc_auto/file.jpg`;
}

export const PIMG: Record<string, string> = {
  olineum: "db159b_bfe0061609ae4274a93b6491dd07ed08~mv2.jpg",
  nippoli: "db159b_6beb68bce7684106a7dbbf14bd9bf408~mv2.jpeg",
  olilax: "db159b_512f372ce1bd443da5fe477b0e544113~mv2.jpeg",
  facioli: "db159b_d83a36f5d9db48899f80d8c01a7f4c55~mv2.jpg",
  bestof: "db159b_85acba9ecd6d486285d017a9ce4307ac~mv2.jpg",
  olibox: "db159b_c3fca06807e24db585466c46f69e0b36~mv2.jpg",
};

export const CLEAN: Record<string, string> = {
  olineum: "/assets/olineum-clean.png",
  oliglow: "/assets/oliglow-clean.png",
  gift: "/assets/gift-clean.png",
};

export const CLEAN_WIDE: Record<string, boolean> = { gift: true };

export const OLILASTIC_SHOT = img("db159b_c6044a549cea41979a5612ff7b19c347~mv2.jpeg");

export type Product = {
  id: string;
  name: string;
  sub: string;
  price: number;
  old?: number;
  cat: string[];
  note?: string;
  badge?: string;
  bg: BgKey;
};

export const PRODUCTS: Product[] = [
  { id: "olilastic", name: "Olilastic", sub: "חמאה למניעה וטשטוש סימני מתיחה", price: 129, cat: ["preg", "best"], note: "הנחה ברכישת שתי חמאות", badge: "הנמכר ביותר", bg: "peach" },
  { id: "olineum", name: "Olineum", sub: "שמן עיסוי להריון", price: 89, cat: ["preg", "best", "birth"], note: "הנחה ברכישת שני שמנים", bg: "cream" },
  { id: "nippoli", name: "NippOli", sub: "חמאת הרגעה לפטמות", price: 69, cat: ["birth", "best"], bg: "rose" },
  { id: "oliglow", name: "Oliglow", sub: "סרום לשיפור מרקם וגוון העור", price: 229, old: 245, cat: ["preg", "best"], bg: "mist" },
  { id: "olilax", name: "Olilax", sub: "קרם עיסוי לרגליים עייפות", price: 94, cat: ["preg"], bg: "peach" },
  { id: "facioli", name: "FaciOli", sub: "קרם לחות לפנים", price: 159, cat: ["preg", "birth"], bg: "cream" },
  { id: "babyspa", name: "Baby Spa Ritual", sub: "שמן עיסוי לתינוק", price: 59, old: 74, cat: ["birth"], badge: "מחיר השקה", bg: "rose" },
  { id: "oli4", name: "Oli 4 Pregnancy", sub: "מארז הריון", price: 379, old: 471, cat: ["preg", "gift"], bg: "mist" },
  { id: "bestof", name: "Best of Oli", sub: "מארז המוצרים האהובים", price: 259, old: 312, cat: ["gift", "best"], bg: "peach" },
  { id: "olibox", name: "Olibox", sub: "מארז לידה מפנק", price: 292.8, old: 366, cat: ["gift", "birth"], bg: "rose" },
  { id: "gift", name: "It's Oli for you", sub: "מתנה ליולדת", price: 358.9, old: 485, cat: ["gift"], bg: "cream" },
  { id: "oils", name: "Home & Oils", sub: "מארז שמנים ואווירה לבית", price: 139, old: 147, cat: ["gift"], bg: "mist" },
  { id: "olimini", name: "Olimini", sub: "מיני מארז היריון", price: 197.6, old: 247, cat: ["preg", "gift"], bg: "peach" },
  { id: "bottle", name: "Birth Bottle", sub: "בקבוק פרי ללידה", price: 55, cat: ["birth"], badge: "חדש", bg: "cream" },
  { id: "olicalm", name: "Olicalm", sub: "נר ארומטי מרגיע", price: 80.1, old: 89, cat: ["gift"], bg: "rose" },
  { id: "poster", name: "My first time", sub: "פוסטר מעקב התפתחות התינוק", price: 107.1, old: 119, cat: ["birth", "gift"], bg: "mist" },
];

export const CATS: Record<string, { t: string; en: string; d: string }> = {
  all: { t: "כל המוצרים", en: "The full collection", d: "מוצרי טיפוח בטוחים, יעילים ומפנקים למסע היקר של ההריון ולאחריו, לצד מתנות ומארזים ליולדת." },
  best: { t: "המומלצים ביותר", en: "Best sellers", d: "המוצרים שהלקוחות שלנו חוזרות אליהם שוב ושוב." },
  preg: { t: "הריון", en: "Pregnancy care", d: "חמאת גוף לסימני מתיחה, שמן עיסוי, קרם לרגליים עייפות וקרם פנים, בטוחים לשימוש לאורך ההריון." },
  birth: { t: "לידה ואחרי לידה", en: "Postpartum care", d: "מוצרים ללידה ולהנקה, ולשבועות הראשונים עם התינוק." },
  gift: { t: "מתנה ליולדת", en: "Birth gifts", d: "מארזים מוכנים למתנה, להריוניות וליולדות." },
};

export function findProduct(name: string) {
  return PRODUCTS.find((p) => p.name === name);
}

export function byId(id: string) {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) throw new Error(id);
  return p;
}

export function cover(url: string, extra?: CSSProperties): CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    backgroundImage: `url("${url}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    ...extra,
  };
}

export function productBg(p: Product) {
  const photo = PIMG[p.id];
  const clean = CLEAN[p.id];
  if (clean) {
    return {
      noImg: false,
      bgStyle: cover(clean, {
        backgroundSize: CLEAN_WIDE[p.id] ? "88% auto" : "auto 80%",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#F3E4D8",
        backgroundBlendMode: "multiply",
      }),
    };
  }
  if (photo) return { noImg: false, bgStyle: cover(img(photo)) };
  return { noImg: true, bgStyle: cover(BG[p.bg]) };
}

export function thumbOf(p: Pick<Product, "id" | "bg">, w = 200, h = 250) {
  const photo = PIMG[p.id];
  if (photo) return img(photo, w, h);
  if (p.id === "olilastic") return OLILASTIC_SHOT;
  return BG[p.bg];
}

export function saveLabel(p: Product) {
  if (!p.old) return "";
  return "חיסכון " + Math.round((1 - p.price / p.old) * 100) + "%";
}

export const VALUES = [
  { n: "01", t: "איכות", d: "אנו מבטיחות שהמוצרים שלנו עומדים בסטנדרטים הגבוהים ביותר של איכות ויעילות." },
  { n: "02", t: "בטיחות", d: "כל המוצרים שלנו מבוססים על מחקרים ועל ספרות מדעית ומאושרים על ידי משרד הבריאות." },
  { n: "03", t: "העצמה", d: "אנו שואפות להעצים נשים באמצעות המוצרים שלנו ועל ידי הקניית ידע רפואי חשוב עבור כל אישה ולהריוניות ואמהות בפרט." },
  { n: "04", t: "טבעיות", d: "המוצרים שלנו מבוססים על רכיבים טבעיים. אנו משתמשות בחומרי הגלם האיכותיים ביותר, מתוצרת הארץ." },
  { n: "05", t: "זכויות בעלי החיים", d: "המוצרים שלנו לא נוסו על בעלי חיים ואף תוכלו למצוא את מדבקת הטבעונות על חלק נכבד ממוצרינו." },
];

export const STAGES: { title: string; en: string; img: string; desc: string; cat: string; bg: string; count: string; wide?: boolean }[] = [
  { title: "הריון", en: "Pregnancy care", img: "/assets/stage-preg.png", desc: "מסימני מתיחה ועד רגליים עייפות, טיפוח בטוח לכל טרימסטר.", cat: "preg", bg: BG.peach, count: PRODUCTS.filter((p) => p.cat.includes("preg")).length + " מוצרים" },
  { title: "לידה ואחרי", en: "Postpartum care", img: "/assets/stage-birth.png", desc: "הכנה ללידה, הנקה והשבועות הראשונים.", cat: "birth", bg: BG.rose, count: PRODUCTS.filter((p) => p.cat.includes("birth")).length + " מוצרים" },
  { title: "מתנות ליולדת", en: "Birth gifts", img: "/assets/stage-gift.png", wide: true, desc: "מארזים מפנקים, מוכנים למסירה.", cat: "gift", bg: BG.mist, count: PRODUCTS.filter((p) => p.cat.includes("gift")).length + " מארזים" },
];

export const REGIONS: { name: string; stores: [string, string][] }[] = [
  { name: "דרום", stores: [["שילב אילת", "אילת"], ["שילב ביג ב״ש", "באר שבע"], ["שילב גרנד קניון באר שבע", "באר שבע"], ["שילב ביג אשדוד", "אשדוד"]] },
  { name: "מרכז", stores: [["שילב ראשון לציון מתחם G", "ראשון לציון"], ["בית שילב איילון", "רמת גן"], ["שילב ביג גלילות", "גלילות"], ["שילב מלחה", "ירושלים"], ["שילב מודיעין", "מודיעין"]] },
  { name: "צפון", stores: [["שילב גרנד קניון חיפה", "חיפה"], ["שילב חוצות המפרץ חיפה", "חיפה"], ["שילב קניון קריון", "קריית ביאליק"], ["שילב דודג׳ סנטר נצרת", "נצרת"], ["שילב עפולה", "עפולה"], ["שילב ירכא מתחם מיי בייבי", "ירכא"]] },
];

const RAW_REVIEWS = [
  { name: "מיכל", verified: " · רכישה מאומתת", date: "22 ביוני", title: "מאוד מרוצה", body: "אני אלרגית לחומר משמר שנמצא בכל תכשירי הביוטי. המשחה ללא אלכוהול, ללא חומר משמר והתגובה של העור נפלאה." },
  { name: "tamar stain", verified: " · רכישה מאומתת", date: "16 ביוני", title: "קפץ לי בפייס ואני ממש מרוצה", body: "קרם נהדר. עושה את העבודה. נעים." },
  { name: "טלי", verified: "", date: "23 במרץ", title: "קרם עשיר ויעיל", body: "הוא עשיר ונספג טוב ומשאיר הרגשה נעימה של עור חלק." },
  { name: "ספיר ס.", verified: "", date: "12 בפבר׳", title: "המלצות מדולות ונשות מקצוע", body: "התחלתי בחודש האחרון יותר להתמיד ומבחינת תוצאות נראה ממש טוב." },
];

export const REVIEWS = RAW_REVIEWS.map((r) => ({
  ...r,
  initial: r.name.trim()[0].toUpperCase(),
  meta: r.date + (r.verified || ""),
}));

export const ACCORDION = [
  { t: "תיאור", p: ["הכירי את Olilastic, חמאת גוף חדשנית, אידיאלית עבור מניעה והפחתה של סימני מתיחה, באמצעות תרכובת ייחודית של שמנים טהורים המכילים: שמן חוחובה, שמן שקדים ושמן זית.", "בחרנו בקפידה שמנים ממקור טבעי עם ריכוז גבוה של ויטמין E ונוגדי חמצון, שילוב ייחודי המספק לחות עמוקה, מגביר את הגמישות ומקדם עור זוהר ובריא."] },
  { t: "הוראות שימוש", p: ["יש למרוח פעמיים ביום- בוקר וערב. מומלץ לאחר מקלחת חמה.", "מומלץ למרוח בכל האיזורים שנוטים להימתח: בטן, חזה, ירכיים, ישבן. ניתן אף בשוקיים."] },
  { t: "נשארה לכן חמאה?", p: ["מעולה! החמאה שלנו יכולה לשמש אתכן לטיפול ביובש ולהרגעת גירודים בעור. משמשת גם כמשחת פלא שתמיד טוב שיש בבית!"] },
  { t: "רשימת INCI מלאה", p: ["[ רשימת רכיבים מלאה ]"] },
];

export const TIMELINE = [
  { when: "גילוי ההריון", what: "ניתן להתחיל להשתמש בחמאה מרגע גילוי ההריון." },
  { when: "שבוע 12", what: "הבטן יוצאת מהאגן הקטן ומתחילה הגדילה. החל משבוע זה מומלץ מאוד להתחיל להשתמש." },
  { when: "בוקר וערב", what: "פעמיים ביום, על בטן, חזה, ירכיים וישבן." },
  { when: "אחרי הלידה", what: "יש להמשיך את השימוש גם מספר חודשים לאחר הלידה." },
];

export const INGREDIENTS = [
  { n: "01", en: "Jojoba", he: "שמן חוחובה", d: "נספג בקלות, עשיר בויטמין E ואומגה 9, משפר את מרקם העור ומגביר את גמישותו." },
  { n: "02", en: "Almond", he: "שמן שקדים", d: "מסייע במניעת סימני מתיחה, עשיר בחומצות שומן חיוניות ובויטמיני B." },
  { n: "03", en: "Olive", he: "שמן זית", d: "מעניק לחות עמוקה, תורם לאלסטיות ורכות העור בזכות הרכב עשיר של ויטמינים ומינרלים." },
  { n: "04", en: "Vitamin E", he: "ויטמין E", d: "נוגד חמצון עוצמתי, מסייע בשמירה על מראה עור גמיש, אחיד ובריא." },
];

export const GALLERY = [
  OLILASTIC_SHOT,
  img(PIMG.bestof, 1200, 1500),
  img(PIMG.olibox, 1200, 1500),
  BG.peach,
];
