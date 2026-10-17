import { NextResponse } from "next/server";
import { promoPercent } from "@/lib/promo-leads";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
  const percent = await promoPercent(code);
  if (!percent) return NextResponse.json({ ok: false });
  return NextResponse.json({ ok: true, percent });
}
