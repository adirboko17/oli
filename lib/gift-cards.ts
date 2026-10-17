import "server-only";
import { STORE_ID } from "@/lib/store";

export type IssuedGiftCard = { code: string; amount: number };

type GiftResult =
  | { ok: true; balance?: number; applied?: number; issued?: IssuedGiftCard[]; orderNumber?: number }
  | { ok: false; reason: string };

async function giftRpc(name: "lookup_store_gift" | "settle_store_gifts", body: Record<string, unknown>): Promise<GiftResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return { ok: false, reason: "כרטיסי המתנה לא מחוברים" };
  const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: secret,
      authorization: `Bearer ${secret}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as GiftResult | null;
  if (!response.ok || !payload || payload.ok !== true) {
    return { ok: false, reason: payload && "reason" in payload && payload.reason ? payload.reason : "הכרטיס לא זמין" };
  }
  return payload;
}

export function lookupGiftCard(code: string) {
  return giftRpc("lookup_store_gift", { target_store: STORE_ID, raw_code: code });
}

export function settleGiftCards(input: {
  name: string;
  email: string;
  phone?: string;
  street?: string;
  city?: string;
  zip?: string;
  shippingName?: string;
  code: string;
  payable: number;
  purchases: number[];
}) {
  return giftRpc("settle_store_gifts", {
    target_store: STORE_ID,
    customer_name: input.name,
    customer_email: input.email,
    customer_phone: input.phone ?? "",
    customer_street: input.street ?? "",
    customer_city: input.city ?? "",
    customer_zip: input.zip ?? "",
    shipping_name: input.shippingName ?? "",
    redeem_code: input.code,
    payable: input.payable,
    purchases: input.purchases,
  });
}
