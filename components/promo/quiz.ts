// Oli: 5% quiz. Questions, branching and product recommendations (all the logic is here)
export type Opt = { k: string; label: string };

export const Q1_TITLE = 'למי אנחנו מתאימות את שגרת הטיפוח?';
export const Q1: Opt[] = [
  { k: 'preg', label: 'אני בהריון' },
  { k: 'post', label: 'אני אחרי לידה' },
  { k: 'plan', label: 'אני מתכננת הריון' },
  { k: 'baby', label: 'אני מחפשת מוצרים לתינוק שלי' },
  { k: 'gift', label: 'אני מחפשת מתנה' },
  { k: 'self', label: 'אני מחפשת טיפוח לעצמי' },
];

// Question 2 changes based on the answer to question 1
export const Q2: Record<string, { title: string; opts: Opt[] }> = {
  preg: { title: 'באיזה שלב את נמצאת?', opts: [
    { k: 't1', label: 'שליש ראשון – שבועות 1–13' },
    { k: 't2', label: 'שליש שני – שבועות 14–27' },
    { k: 't3', label: 'שליש שלישי – שבוע 28 ומעלה' } ] },
  post: { title: 'כמה זמן עבר מהלידה?', opts: [
    { k: 'w6', label: 'עד 6 שבועות' }, { k: 'm6', label: '6 שבועות עד חצי שנה' }, { k: 'y1', label: 'יותר מחצי שנה' } ] },
  plan: { title: 'מתי את מתכננת להיכנס להריון?', opts: [
    { k: 'soon', label: 'בחודשים הקרובים' }, { k: 'year', label: 'במהלך השנה הקרובה' }, { k: 'unk', label: 'עוד לא בטוח' } ] },
  baby: { title: 'בן או בת כמה התינוק?', opts: [
    { k: 'nb', label: 'יילוד, עד 3 חודשים' }, { k: 'b12', label: '3–12 חודשים' }, { k: 'b1', label: 'מעל שנה' } ] },
  gift: { title: 'למי המתנה?', opts: [
    { k: 'gpreg', label: 'לאישה בהריון' }, { k: 'gpost', label: 'ליולדת טרייה' }, { k: 'gbaby', label: 'לתינוק החדש' } ] },
  self: { title: 'איך היית מתארת את העור שלך?', opts: [
    { k: 'dry', label: 'יבש ומבקש לחות' }, { k: 'sens', label: 'רגיש' }, { k: 'norm', label: 'רגיל' } ] },
};

export const Q3_TITLE = 'מה הכי חשוב לך כרגע?';
const L3: Record<string, string> = {
  belly: 'טיפוח עור הבטן וסימני מתיחה',
  legs: 'הקלה על תחושת כבדות ברגליים',
  face: 'טיפוח עור הפנים',
  birth: 'הכנת הגוף ללידה',
  post: 'טיפוח והקלה אחרי לידה',
  baby: 'טיפוח עור התינוק',
  self: 'פינוק וטיפוח עצמי',
};

// The options for question 3 change based on the previous answers
export function q3Options(a1?: string, a2?: string): Opt[] {
  let keys: string[];
  if (a1 === 'preg') keys = a2 === 't3' ? ['belly', 'birth', 'legs', 'face', 'self'] : ['belly', 'legs', 'face', 'self'];
  else if (a1 === 'post') keys = ['post', 'belly', 'face', 'baby', 'self'];
  else if (a1 === 'plan') keys = ['belly', 'face', 'self'];
  else if (a1 === 'baby') keys = ['baby', 'post', 'self'];
  else if (a1 === 'gift') keys = a2 === 'gpreg' ? ['belly', 'legs', 'self'] : a2 === 'gpost' ? ['post', 'baby', 'self'] : ['baby', 'self'];
  else keys = ['face', 'legs', 'belly', 'self'];
  return keys.map(k => ({ k, label: L3[k] }));
}

// Recommended products (product ids from the catalog) for each answer to question 3
export const RECOMMEND: Record<string, string[]> = {
  belly: ['olilastic', 'olineum'],
  legs: ['olilax', 'olilastic'],
  face: ['facioli', 'oliglow'],
  birth: ['olineum', 'olilastic'],
  post: ['nippoli', 'olineum'],
  baby: ['babyspa', 'babyafter'],
  self: ['bestof', 'oliglow'],
};
