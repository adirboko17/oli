import { NextResponse } from "next/server";
import { lookupGiftCard } from "@/lib/gift-cards";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!code) return NextResponse.json({ ok: false });
  const card = await lookupGiftCard(code);
  if (!card.ok || !card.balance) return NextResponse.json({ ok: false, message: card.ok ? "היתרה בכרטיס נוצלה" : card.reason });
  return NextResponse.json({ ok: true, balance: card.balance });
}
