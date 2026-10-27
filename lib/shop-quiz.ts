import { Q1, Q1_TITLE, Q2, Q3_TITLE, RECOMMEND, q3Options } from "@/components/promo/quiz";

export type QuizChoice = { id: string; label: string; next: string; products: string[] };
export type QuizQuestion = { id: string; title: string; choices: QuizChoice[] };

export type QuizFlow = {
  introEyebrow: string;
  introTitle: string;
  introText: string;
  pills: string[];
  startLabel: string;
  image: string;
  mediaPercent: string;
  mediaEyebrow: string;
  mediaLabel: string;
  formTitle: string;
  formText: string;
  submitLabel: string;
  legal: string;
  doneEyebrow: string;
  doneTitle: string;
  doneText: string;
  recoTitle: string;
  shopLabel: string;
  entry: string;
  questions: QuizQuestion[];
};

export type QuizAnswer = { questionId: string; choiceId: string };

const FORM = "form";

function clip(value: unknown, max: number) {
  return typeof value === "string" ? value.replace(/\u0000/g, "").trim().slice(0, max) : "";
}

function quizId(value: unknown) {
  const id = clip(value, 25).toLowerCase();
  return /^[a-z][a-z0-9_]{0,24}$/.test(id) ? id : "";
}

function handle(value: unknown) {
  const id = clip(value, 41).toLowerCase();
  return /^[a-z0-9][a-z0-9-]{0,40}$/.test(id) ? id : "";
}

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

export function parseShopQuiz(value: unknown): QuizFlow | null {
  const row = record(value);
  if (!row || !Array.isArray(row.questions) || row.questions.length < 1 || row.questions.length > 40) return null;
  const questions: QuizQuestion[] = [];
  const seen = new Set<string>();
  for (const item of row.questions) {
    const question = record(item);
    const id = quizId(question?.id);
    const title = clip(question?.title, 160);
    if (!question || !id || !title || seen.has(id) || !Array.isArray(question.choices) || question.choices.length < 1 || question.choices.length > 12) return null;
    seen.add(id);
    const choices: QuizChoice[] = [];
    const choiceIds = new Set<string>();
    for (const raw of question.choices) {
      const choice = record(raw);
      const choiceId = quizId(choice?.id);
      const label = clip(choice?.label, 80);
      const next = quizId(choice?.next);
      if (!choice || !choiceId || !label || !next || choiceId === FORM || choiceIds.has(choiceId) || next === id) return null;
      choiceIds.add(choiceId);
      const products: string[] = [];
      if (Array.isArray(choice.products)) {
        for (const product of choice.products) {
          const name = handle(product);
          if (!name || products.includes(name)) continue;
          products.push(name);
          if (products.length >= 4) break;
        }
      }
      choices.push({ id: choiceId, label, next, products: next === FORM ? products : [] });
    }
    questions.push({ id, title, choices });
  }
  const entry = quizId(row.entry);
  if (!entry || !seen.has(entry)) return null;
  for (const question of questions) {
    for (const choice of question.choices) {
      if (choice.next !== FORM && !seen.has(choice.next)) return null;
    }
  }
  const started = new Set<string>();
  const stack = new Set<string>();
  function walk(id: string): boolean {
    if (id === FORM) return true;
    if (stack.has(id)) return false;
    if (started.has(id)) return true;
    const question = questions.find((item) => item.id === id);
    if (!question) return false;
    stack.add(id);
    for (const choice of question.choices) {
      if (!walk(choice.next)) return false;
    }
    stack.delete(id);
    started.add(id);
    return true;
  }
  if (!walk(entry)) return null;
  const image = clip(row.image, 800);
  return {
    introEyebrow: clip(row.introEyebrow, 40),
    introTitle: clip(row.introTitle, 120),
    introText: clip(row.introText, 280),
    pills: Array.isArray(row.pills) ? row.pills.flatMap((pill) => { const label = clip(pill, 40); return label ? [label] : []; }).slice(0, 6) : [],
    startLabel: clip(row.startLabel, 40) || "בואו נתחיל",
    image: /^https:\/\/[^\s"'()<>]+$/i.test(image) ? image : "",
    mediaPercent: clip(row.mediaPercent, 8),
    mediaEyebrow: clip(row.mediaEyebrow, 40),
    mediaLabel: clip(row.mediaLabel, 80),
    formTitle: clip(row.formTitle, 120),
    formText: clip(row.formText, 240),
    submitLabel: clip(row.submitLabel, 40) || "שליחה",
    legal: clip(row.legal, 240),
    doneEyebrow: clip(row.doneEyebrow, 80),
    doneTitle: clip(row.doneTitle, 80),
    doneText: clip(row.doneText, 240),
    recoTitle: clip(row.recoTitle, 80),
    shopLabel: clip(row.shopLabel, 40) || "לכל המוצרים",
    entry,
    questions,
  };
}

export function quizRecommendation(flow: QuizFlow, answers: QuizAnswer[]) {
  let id = flow.entry;
  let products: string[] = [];
  const seen = new Set<string>();
  for (const answer of answers) {
    if (seen.has(id) || answer.questionId !== id) return null;
    seen.add(id);
    const question = flow.questions.find((item) => item.id === id);
    const choice = question?.choices.find((item) => item.id === answer.choiceId);
    if (!choice) return null;
    if (choice.next === FORM) products = choice.products;
    id = choice.next;
  }
  return id === FORM ? products.slice(0, 4) : null;
}

const DEFAULT_IMAGE = "https://static.wixstatic.com/media/db159b_023efbddb9054a1695b0af97979b8d28f000.jpg";

/** The quiz that stays on the site until a published quiz arrives from the CMS. */
export function builtinQuizFlow(): QuizFlow {
  const questions: QuizQuestion[] = [{
    id: "q1",
    title: Q1_TITLE,
    choices: Q1.map((opt) => ({ id: opt.k, label: opt.label, next: `q2_${opt.k}`, products: [] })),
  }];
  for (const first of Q1) {
    const second = Q2[first.k];
    if (!second) continue;
    questions.push({
      id: `q2_${first.k}`,
      title: second.title,
      choices: second.opts.map((opt) => ({ id: opt.k, label: opt.label, next: `q3_${first.k}_${opt.k}`, products: [] })),
    });
    for (const opt of second.opts) {
      questions.push({
        id: `q3_${first.k}_${opt.k}`,
        title: Q3_TITLE,
        choices: q3Options(first.k, opt.k).map((item) => ({
          id: item.k,
          label: item.label,
          next: FORM,
          products: [...(RECOMMEND[item.k] ?? [])].slice(0, 4),
        })),
      });
    }
  }
  return {
    introEyebrow: "מתנת הצטרפות",
    introTitle: "ענו על 3 שאלות\nוקבלו 5% הנחה",
    introText: "לרכישה הקרובה שלכן באתר. ובדרך נתאים לכן את המוצרים שהכי מתאימים לתקופה שלכן.",
    pills: ["3 שאלות קצרות", "פחות מדקה", "המלצות אישיות"],
    startLabel: "בואו נתחיל",
    image: DEFAULT_IMAGE,
    mediaPercent: "5%",
    mediaEyebrow: "מתנת הצטרפות",
    mediaLabel: "על ההזמנה הראשונה",
    formTitle: "יש לנו משהו במיוחד בשבילך 🤎",
    formText: "השאירי פרטים, קבלי 5% הנחה וגלי את המוצרים שמתאימים לך.",
    submitLabel: "קבלי את ההטבה שלי",
    legal: "בהשארת הפרטים את מאשרת לקבל מאיתנו עדכונים והטבות. אפשר להסיר בכל עת.",
    doneEyebrow: "ברוכה הבאה, {name}",
    doneTitle: "ההטבה שלך מוכנה",
    doneText: "שלחנו את הקוד גם למייל. מזינים אותו בקופה.",
    recoTitle: "המוצרים שמתאימים לך",
    shopLabel: "לכל המוצרים",
    entry: "q1",
    questions,
  };
}
