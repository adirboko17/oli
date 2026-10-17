import { NextResponse } from "next/server";

const TOPICS: Record<string, string> = {
  product: "שאלה על מוצר",
  order: "הזמנה קיימת",
  collab: "שיתוף פעולה",
  other: "אחר",
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;
const hits = new Map<string, { count: number; start: number }>();

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
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
  if (text(body?.company, 200)) return NextResponse.json({ ok: true });

  const topic = TOPICS[text(body?.topic, 20)] ? text(body?.topic, 20) : "";
  const name = text(body?.name, 80);
  const phone = text(body?.phone, 30);
  const email = text(body?.email, 120);
  const order = text(body?.order, 40);
  const message = text(body?.message, 4000);
  if (!topic || !name || !EMAIL_RE.test(email) || message.length < 3) {
    return NextResponse.json({ ok: false, error: "fields" }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) return NextResponse.json({ ok: false, error: "mail" }, { status: 503 });

  const lines = [
    `נושא: ${TOPICS[topic]}`,
    `שם: ${name}`,
    `טלפון: ${phone || "—"}`,
    `אימייל: ${email}`,
    order ? `הזמנה: ${order}` : "",
    "",
    message,
  ].filter(Boolean);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || "Oli Safe Care <info@olisafecare.com>",
      to: ["info@olisafecare.com"],
      reply_to: email,
      subject: `צרי קשר · ${TOPICS[topic]}`,
      text: lines.join("\n"),
    }),
  });
  if (!response.ok) return NextResponse.json({ ok: false, error: "mail" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
