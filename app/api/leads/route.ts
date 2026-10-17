import { NextResponse } from "next/server";
import { Q1, Q2, RECOMMEND, q3Options } from "@/components/promo/quiz";
import { issuePromoLead } from "@/lib/promo-leads";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^05\d{8}$/;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 8;
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
  const name = text(body?.name, 80);
  const phone = text(body?.phone, 20).replace(/\D/g, "");
  const email = text(body?.email, 120).toLowerCase();
  const a1 = text(body?.a1, 20);
  const a2 = text(body?.a2, 20);
  const a3 = text(body?.a3, 20);
  const recommended = Array.isArray(body?.recommended) ? body.recommended.filter((id: unknown) => typeof id === "string").slice(0, 2) : [];
  const q2 = Q2[a1];
  const q3 = q3Options(a1, a2).some((opt) => opt.k === a3);
  const expected = RECOMMEND[a3] || [];
  if (!name || !PHONE_RE.test(phone) || !EMAIL_RE.test(email) || !Q1.some((opt) => opt.k === a1) || !q2?.opts.some((opt) => opt.k === a2) || !q3) {
    return NextResponse.json({ ok: false, error: "fields" }, { status: 400 });
  }
  if (recommended.some((id: string) => !expected.includes(id))) {
    return NextResponse.json({ ok: false, error: "fields" }, { status: 400 });
  }

  const code = await issuePromoLead({ name, phone, email, a1, a2, a3, recommended });
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
