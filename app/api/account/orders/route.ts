import { NextResponse } from "next/server";
import { STORE_ID } from "@/lib/store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { phone?: unknown; email?: unknown } | null;
  const phone = String(body?.phone ?? "");
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (phone.replace(/\D/g, "").length < 9 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: true, orders: [] });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return NextResponse.json({ ok: true, orders: [] });
  const response = await fetch(`${url}/rest/v1/rpc/customer_order_statuses`, {
    method: "POST",
    headers: {
      apikey: secret,
      authorization: `Bearer ${secret}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ target_store: STORE_ID, customer_phone: phone, customer_email: email }),
    cache: "no-store",
  });
  const orders = (await response.json().catch(() => [])) as unknown;
  return NextResponse.json({ ok: response.ok, orders: Array.isArray(orders) ? orders : [] });
}
