import { NextResponse } from "next/server";
import { STORE_ID } from "@/lib/store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    phone?: unknown;
    email?: unknown;
    orderNumber?: unknown;
    productId?: unknown;
    stars?: unknown;
    text?: unknown;
  } | null;
  const phone = String(body?.phone ?? "");
  const email = String(body?.email ?? "").trim().toLowerCase();
  const orderNumber = Number(body?.orderNumber);
  const productId = String(body?.productId ?? "");
  const stars = Number(body?.stars);
  const text = String(body?.text ?? "").slice(0, 1000);
  if (phone.replace(/\D/g, "").length < 9 || !EMAIL_RE.test(email) || !Number.isInteger(orderNumber) || !UUID_RE.test(productId) || !Number.isInteger(stars) || stars < 1 || stars > 5) {
    return NextResponse.json({ ok: false, reason: "הביקורת לא נשלחה. בדקי את הפרטים ונסי שוב." });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return NextResponse.json({ ok: false, reason: "לא הצלחנו לשלוח את הביקורת כרגע." });
  const response = await fetch(`${url}/rest/v1/rpc/submit_product_review`, {
    method: "POST",
    headers: {
      apikey: secret,
      authorization: `Bearer ${secret}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      target_store: STORE_ID,
      customer_phone: phone,
      customer_email: email,
      order_number: orderNumber,
      product_id: productId,
      stars,
      review_body: text,
    }),
    cache: "no-store",
  });
  const result = (await response.json().catch(() => null)) as { ok?: boolean; status?: string; reason?: string; message?: string } | null;
  if (!response.ok || !result || result.ok !== true) {
    return NextResponse.json({ ok: false, reason: result?.reason || "לא הצלחנו לשלוח את הביקורת." });
  }
  return NextResponse.json({ ok: true, status: result.status === "pending" ? "pending" : "published" });
}
