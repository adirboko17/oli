import { NextResponse } from "next/server";
import { saveEventNotify } from "@/lib/event-signups";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 8;
const hits = new Map<string, { count: number; start: number }>();

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
  if (limited(ip)) return NextResponse.json({ ok: false }, { status: 429 });
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const saved = await saveEventNotify(email);
  if (!saved) return NextResponse.json({ ok: false }, { status: 400 });
  return NextResponse.json({ ok: true });
}
