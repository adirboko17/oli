// Public URLs from the previous olisafecare.com site. The key is the internal English slug.
const ARTICLE_PATHS: Record<string, string> = {
  "stretch-marks": "/סימני-מתיחה-בהריון",
  "perineal-massage": "/עיסוי-פרינאום",
  "swelling-in-pregnancy": "/בצקות-בהריון",
  "preparing-the-perineum": "/הכנת-הפרינאום-ללידה",
  "perineal-massage-after-birth": "/עיסוי-פרינאום-אחרי-לידה",
  "breastfeeding-mistakes": "/טעויות-נפוצות-בהנקה",
  "face-cream-in-pregnancy": "/איך-לבחור-קרם-פנים-בהריון",
  "retinoids-in-pregnancy": "/רטינואידים-בהריון-ורטינול-בהריון",
  "pregnancy-side-effects": "/תופעות-לוואי-בהריון",
  "skin-hair-nails-in-pregnancy": "/עור-שיער-וציפורניים-בהריון",
  "first-days-after-cesarean": "/טיפים-לימים-הראשונים-אחרי-ניתוח-קיסרי",
  "breastfeeding-complex": "/הנקה-אחרי-קיסרי-פגות-או-סטרס",
  "delivery-room-decisions": "/איך-לקבל-החלטות-בחדר-לידה",
  "wonders-of-breastfeeding": "/פלאי-ההנקה",
  "prenatal-care-by-week": "/מעקב-הריון-לפי-שבועות",
  "stages-of-labor": "/מדריך-שלבי-הלידה",
  "baby-massage-stress": "/עיסוי-תינוקות-בתקופות-של-סטרס",
  "assisted-delivery": "/לידה-מכשירנית",
  "infant-sleep": "/שנת-תינוקות",
  "birth-to-discharge": "/מיום-הלידה-עד-השחרור",
  "body-changes-in-pregnancy": "/המדריך-לשינויים-בגוף-בהריון",
  "atopic-dermatitis": "/אטופיק-דרמטיטיס",
  "seborrheic-dermatitis": "/סבוריאה-דרמטיטיס",
  "infections-in-pregnancy": "/זיהומים-בהריון-מדריך-מעשי",
  "water-breaking-without-contractions": "/מאמרים/ירידת-מים-ללא-צירים",
  "abdominal-massage-after-cesarean": "/עיסוי-בטן-אחרי-ניתוח-קיסרי",
  "sexuality-in-pregnancy": "/מיניות-בהריון-ולאחר-לידה",
  "mindfulness-in-pregnancy": "/מיינדפולנס-בהריון",
  "pelvic-floor-load": "/עומס-על-רצפת-האגן-בהריון-ואחרי-לידה",
  "vocalization-in-labor": "/הפקת-קול-בלידה",
  "summer-foods-in-pregnancy": "/זיהומי-מזון-בקיץ-בהריון",
  "sids-and-cpr": "/מניעת-מוות-בעריסה",
  "sibling-quality-time": "/זמן-איכות-בין-אחים",
  "movement-at-work": "/טיפים-לשמירה-על-תנועתיות-בהריון-ביום-עבודה",
  "perineal-oil-bottles": "/כמה-בקבוקי-שמן-שקדים-צריך-ללידה",
  "exercise-in-pregnancy": "/פעילות-גופנית-בהריון",
  "summer-vacation-in-pregnancy": "/המלצות-לחופשת-קיץ-לנשים-בהריון",
  "zika-travel-in-pregnancy": "/זיקה-ותאילנד-בהריון",
  "enema-before-labor": "/copy-of-תסחיף-מי-שפיר",
  "oxytocin-in-labor": "/אוקסיטוצין-בלידה",
  "infant-hip-ultrasound": "/אולטרסאונד-פרקי-ירך-לתינוקות",
  "symphysis-pubis": "/סימפיזיולויזיס-בהריון",
  "apgar-score": "/מבחן-אפגר",
  "amniotic-and-foodborne-infection": "/זיהומים-בהריון",
  "pregnancy-after-40": "/copy-of-דימום-בתחילת-היריון-מה-זה-אומר",
  "early-pregnancy-bleeding": "/copy-of-understanding-and-treating-st",
  "obesity-in-pregnancy": "/השמנת-יתר-בהריון",
  "shoulder-dystocia": "/פרע-כתף",
  "amniotic-fluid-embolism": "/תסחיף-מי-שפיר",
  "acne-in-pregnancy": "/copy-of-פיגמנטציה-בהריון-מה-את-צריכה",
  "pigmentation-in-pregnancy": "/פיגמנטציה-בהריון",
  "sensory-regulation": "/ויסות-חושי-אצל-תינוקות",
  "salicylic-acid-in-pregnancy": "/חומצה-סליצילית-בהריון",
};

const ALIASES: Record<string, string> = {
  "/חוקן-לפני-לידה": "/copy-of-תסחיף-מי-שפיר",
  "/ירידת-מים-ללא-צירים": "/מאמרים/ירידת-מים-ללא-צירים",
};

const SLUG_BY_PATH = new Map(Object.entries(ARTICLE_PATHS).map(([slug, path]) => [path, slug]));

export function articlePublicPath(slug: string) {
  const key = decode(slug);
  return ARTICLE_PATHS[key] ?? "";
}

export function normalizeArticlePath(pathname: string) {
  const path = decode(pathname) || "/";
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

export function articleRedirectPath(pathname: string) {
  const path = normalizeArticlePath(pathname);
  if (path.startsWith("/en/")) {
    const rest = path.slice(3);
    if (rest === "/מאמרים" || SLUG_BY_PATH.has(rest) || ALIASES[rest]) return ALIASES[rest] || rest;
  }
  if (ALIASES[path]) return ALIASES[path];
  const english = englishSlug(path);
  if (english && ARTICLE_PATHS[english]) return ARTICLE_PATHS[english];
  return "";
}

export function articleSlugForPath(pathname: string) {
  return SLUG_BY_PATH.get(normalizeArticlePath(pathname)) ?? "";
}

export function isArticleSection(pathname: string) {
  const path = normalizeArticlePath(pathname);
  if (path === "/articles" || path.startsWith("/articles/") || path === "/journal" || path.startsWith("/journal/")) return true;
  if (path === "/מאמרים" || path.startsWith("/מאמרים/")) return true;
  if (path.startsWith("/en/מאמרים") || path.startsWith("/en/articles")) return true;
  return Boolean(articleSlugForPath(path) || ALIASES[path] || articleSlugForPath(ALIASES[path] || ""));
}

function englishSlug(pathname: string) {
  if (pathname.startsWith("/articles/") && pathname !== "/articles") return decode(pathname.slice("/articles/".length));
  if (pathname.startsWith("/journal/") && pathname !== "/journal") return decode(pathname.slice("/journal/".length));
  return "";
}

function decode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
