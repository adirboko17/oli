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
export const Q2: Record<string, { title: string; week?: boolean; opts: Opt[] }> = {
  preg: { title: 'באיזה שבוע הריון את?', week: true, opts: [
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
// A different question-3 title for a specific path (otherwise Q3_TITLE)
export const Q3_TITLES: Record<string, string> = {
  baby: 'מה הכי מעסיק אותך בעור של התינוק?',
};
const L3: Record<string, string> = {
  bdaily: 'אין בעיה מיוחדת, רוצה שגרת רחצה וטיפוח יומית',
  bdiaper: 'אדמומיות או תפרחת באזור החיתול',
  bdry: 'עור יבש או מתקלף',
  batopic: 'אקזמה או עור אטופי',
  bscalp: 'קשקשים בקרקפת (סבוריאה)',
  bsens: 'עור רגיש שמגיב בקלות',
  bkit: 'סט טיפוח מלא לתינוק',
  belly: 'טיפוח עור הבטן וסימני מתיחה',
  legs: 'הקלה על תחושת כבדות ברגליים',
  face: 'טיפוח עור הפנים',
  birth: 'הכנת הגוף ללידה',
  post: 'טיפוח והקלה אחרי לידה',
  baby: 'טיפוח עור התינוק',
  self: 'פינוק וטיפוח עצמי',
};

// Week slider (1–42): the week is converted to a trimester behind the scenes, so the rest of the questionnaire stays the same
export const WEEK_MIN = 1;
export const WEEK_MAX = 42;
export function weekToTrimester(week: number) {
  return week <= 13 ? 't1' : week <= 27 ? 't2' : 't3';
}

// Paths that end after question 2 (no question 3): products straight from the question-2 answer.
// Gift: the giver doesn't know the products, so we go straight to fitting options.
export const Q2_FINAL: Record<string, Record<string, string[]>> = {
  gift: {
    // Oli 4 Pregnancy, Olimini (pregnancy mini kit), Best of Oli, gift card
    gpreg: ['oli4', 'olimini', 'bestof', '928fa1b0-0db6-4574-8883-a870c0c1471c'],
    // Olibox, home oils-and-atmosphere set, NippOli, gift card
    gpost: ['olibox', 'e1d029d6-71a9-4228-af5c-ab9cb34f269c', 'nippoli', '928fa1b0-0db6-4574-8883-a870c0c1471c'],
    // All four of the Olimini kit (kit price in the cart)
    gbaby: ['spray--away', 'pre--shower-ritual', 'after-shower-ritual', 'babyspa'],
  },
};

// The options for question 3 change based on the previous answers
export function q3Options(a1?: string, a2?: string): Opt[] {
  let keys: string[];
  if (a1 === 'preg') keys = a2 === 't3' ? ['belly', 'birth', 'legs', 'face', 'self'] : ['belly', 'legs', 'face', 'self'];
  else if (a1 === 'post') keys = ['post', 'belly', 'face', 'baby', 'self'];
  else if (a1 === 'plan') keys = ['belly', 'face', 'self'];
  else if (a1 === 'baby') keys = ['bdaily', 'bdiaper', 'bdry', 'batopic', 'bscalp', 'bsens', 'bkit']; // same for every age
  else keys = ['face', 'legs', 'belly', 'self'];
  return keys.map(k => ({ k, label: L3[k] }));
}

// Recommended products (product ids from the catalog) for each answer to question 3
export const RECOMMEND: Record<string, string[]> = {
  belly: ['olilastic', 'olineum', 'olimini', 'oli4'],
  legs: ['olilax', 'olilastic', 'oli4'],
  face: ['facioli', 'oliglow'],
  birth: ['olineum', 'olilastic', 'bottle', 'nippoli'],
  post: ['nippoli', 'olineum', 'olibox', 'olilastic'],
  baby: ['babyspa', 'pre--shower-ritual', 'after-shower-ritual', 'spray--away'],
  self: ['bestof', 'oliglow', 'facioli', 'olilastic'],
  // Baby path. babyspa = baby massage oil (in stock), pudding = pre--shower-ritual,
  // cream = after-shower-ritual, diaper spray = spray--away, olilastic = stretch-mark butter
  bdaily: ['babyspa', 'pre--shower-ritual', 'after-shower-ritual', 'spray--away'],
  bdiaper: ['spray--away', 'after-shower-ritual', 'pre--shower-ritual', 'babyspa'],
  bdry: ['babyspa', 'pre--shower-ritual', 'after-shower-ritual', 'olilastic'],
  batopic: ['babyspa', 'pre--shower-ritual', 'after-shower-ritual', 'olilastic'],
  bscalp: ['babyspa', 'pre--shower-ritual', 'after-shower-ritual'],
  bsens: ['babyspa', 'pre--shower-ritual', 'after-shower-ritual'],
  // All four of the Olimini kit: with all four in the cart it automatically drops to the kit price
  bkit: ['spray--away', 'pre--shower-ritual', 'after-shower-ritual', 'babyspa'],
};
