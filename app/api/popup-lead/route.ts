import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { submitPopupLead } from "@/lib/storely-shop";

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
  if (limited(ip)) return NextResponse.json({ ok: false, reason: "נסו שוב בעוד רגע" }, { status: 429 });
  const body = await request.json().catch(() => null) as { popupId?: unknown; fields?: unknown; path?: unknown } | null;
  const popupId = typeof body?.popupId === "string" ? body.popupId : "";
  const path = typeof body?.path === "string" ? body.path : "/";
  const fields = body?.fields && typeof body.fields === "object" && !Array.isArray(body.fields) ? body.fields as Record<string, unknown> : null;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(popupId) || !fields) {
    return NextResponse.json({ ok: false, reason: "חסרים פרטים" }, { status: 400 });
  }
  const host = (await headers()).get("host");
  const result = await submitPopupLead({ hostHeader: host, popupId, fields, pagePath: path });
  if (!result.ok) return NextResponse.json(result, { status: 400 });
  return NextResponse.json({ ok: true });
}
