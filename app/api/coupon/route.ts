import { NextResponse } from "next/server";

const COUPONS: Record<string, number> = { OLI5: 5 };

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
  const percent = COUPONS[code];
  if (!percent) return NextResponse.json({ ok: false });
  return NextResponse.json({ ok: true, percent });
}
