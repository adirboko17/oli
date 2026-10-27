import { NextResponse } from "next/server";
import { builtinQuizFlow, quizRecommendation, type QuizAnswer } from "@/lib/shop-quiz";
import { issuePromoLead } from "@/lib/promo-leads";
import { loadShopQuiz } from "@/lib/storely-shop";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^05\d{8}$/;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 8;
const hits = new Map<string, { count: number; start: number }>();

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function answersOf(value: unknown): QuizAnswer[] {
  if (!Array.isArray(value)) return [];
  const answers: QuizAnswer[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const questionId = text(row.questionId, 25).toLowerCase();
    const choiceId = text(row.choiceId, 25).toLowerCase();
    if (!/^[a-z][a-z0-9_]{0,24}$/.test(questionId) || !/^[a-z][a-z0-9_]{0,24}$/.test(choiceId)) return [];
    answers.push({ questionId, choiceId });
    if (answers.length > 20) return [];
  }
  return answers;
}

function limited(ip: string) {
  const now = Date.now();
  const row = hits.get(ip);
  if (!row || now - row.start > WINDOW_MS) {
    hits.set(ip, { count: 1, start: now });
    return false;
  }
  row.count += 1;
  return row.count > MAX_HITS;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return NextResponse.json({ ok: false, error: "rate" }, { status: 429 });

  const body = await request.json().catch(() => null);
  const name = text(body?.name, 80);
  const phone = text(body?.phone, 20).replace(/\D/g, "");
  const email = text(body?.email, 120).toLowerCase();
  const answers = answersOf(body?.answers);
  const flow = (await loadShopQuiz(request.headers.get("host"))) ?? builtinQuizFlow();
  const recommended = quizRecommendation(flow, answers);
  if (!name || !PHONE_RE.test(phone) || !EMAIL_RE.test(email) || !recommended) {
    return NextResponse.json({ ok: false, error: "fields" }, { status: 400 });
  }

  const code = await issuePromoLead({
    name,
    phone,
    email,
    a1: answers[0]?.choiceId ?? "",
    a2: answers[1]?.choiceId ?? "",
    a3: answers[2]?.choiceId ?? "",
    path: answers,
    recommended,
  });
  if (!code) return NextResponse.json({ ok: false, error: "used" }, { status: 409 });

  const key = process.env.RESEND_API_KEY;
  if (key) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || "Oli Safe Care <info@olisafecare.com>",
        to: [email],
        reply_to: "info@olisafecare.com",
        subject: "הקוד שלך ל-5% הנחה ב-Oli",
        text: `היי ${name},\nהקוד שלך להנחה של 5% על ההזמנה הראשונה: ${code}\nמזינים אותו בקופה.\n`,
      }),
    }).catch(() => null);
  }

  return NextResponse.json({ ok: true, code });
}
