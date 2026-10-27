import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { loadPublicCatalog } from "@/lib/catalog";
import { isGiftLine, resolvePrice, storefrontLines } from "@/lib/checkout-lines";
import { settleGiftCards } from "@/lib/gift-cards";
import { isPickupZone, shippingAfterFreeThreshold } from "@/lib/shipping";
import { createVisitorKey, validVisitorKey, VISITOR_COOKIE, visitorCookieOptions } from "@/lib/storely";
import { trackPurchase } from "@/lib/storely-actions";
import { loadShopShipping, quoteCheckout, storefrontHost, type StoreLine } from "@/lib/storely-shop";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^05\d{8}$/;
const STORE_HOST = "oli-eosin.vercel.app";

type PlacedOrder = { orderNumber: string; total: number; shipping: number; discount: number };

function orderAmount(value: unknown, fallback: number) {
  const amount = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : fallback;
}

function orderReason(value: unknown) {
  if (!value || typeof value !== "object") return "לא הצלחנו לשמור את ההזמנה";
  const record = value as Record<string, unknown>;
  const reason = typeof record.reason === "string" ? record.reason.trim() : "";
  if (reason) return reason;
  const message = typeof record.message === "string" ? record.message.trim() : "";
  return message || "לא הצלחנו לשמור את ההזמנה";
}

async function placeStorefrontOrder(input: {
  lines: StoreLine[];
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  zip: string;
  shippingName: string;
  code: string;
  giftCode: string;
  hostname: string;
}): Promise<{ ok: true; order: PlacedOrder } | { ok: false; reason: string }> {
  const url = process.env.STORELY_SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = process.env.STORELY_PUBLISHABLE_KEY?.trim();
  const trackingKey = process.env.STORELY_TRACKING_KEY?.trim();
  if (!url || !key || !trackingKey) {
    const missing = [
      ["STORELY_SUPABASE_URL", url],
      ["STORELY_PUBLISHABLE_KEY", key],
      ["STORELY_TRACKING_KEY", trackingKey],
    ].filter(([, value]) => !value).map(([name]) => name);
    console.error(`Storely order was not sent: missing ${missing.join(", ")}`);
    return { ok: false, reason: "לא הצלחנו לשמור את ההזמנה" };
  }

  const jar = await cookies();
  const current = jar.get(VISITOR_COOKIE)?.value;
  const visitorKey = validVisitorKey(current) ? current : createVisitorKey();
  if (!validVisitorKey(current)) jar.set(VISITOR_COOKIE, visitorKey, visitorCookieOptions());

  let response: Response;
  try {
    response = await fetch(`${url}/rest/v1/rpc/place_storefront_order`, {
      method: "POST",
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        tracking_key: trackingKey,
        hostname: input.hostname || STORE_HOST,
        visitor_key: visitorKey,
        lines: input.lines,
        customer_name: input.name,
        customer_email: input.email,
        customer_phone: input.phone,
        customer_street: input.street,
        customer_city: input.city,
        customer_zip: input.zip,
        shipping_name: input.shippingName,
        code: input.code,
        gift_code: input.giftCode,
        payment_status: "paid",
      }),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { ok: false, reason: "לא הצלחנו לשמור את ההזמנה" };
  }

  let payload: unknown = await response.json().catch(() => null);
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      payload = null;
    }
  }
  const record = payload && typeof payload === "object" ? payload as Record<string, unknown> : null;
  const orderNumber = typeof record?.orderNumber === "string" || typeof record?.orderNumber === "number"
    ? String(record.orderNumber).trim()
    : "";
  if (!response.ok || record?.ok !== true || !orderNumber) {
    return { ok: false, reason: orderReason(record) };
  }
  return {
    ok: true,
    order: {
      orderNumber,
      total: orderAmount(record.total, 0),
      shipping: orderAmount(record.shipping, 0),
      discount: orderAmount(record.discount, 0),
    },
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const shippingName = typeof body?.shippingName === "string" ? body.shippingName.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.replace(/\D/g, "") : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const city = typeof body?.city === "string" ? body.city.trim() : "";
  const street = typeof body?.street === "string" ? body.street.trim() : "";
  const zip = typeof body?.zip === "string" ? body.zip.trim() : "";
  const rawItems = Array.isArray(body?.items) ? body.items : [];
  if (!shippingName || !name || !PHONE_RE.test(phone) || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "missing" }, { status: 400 });
  }

  const qtyById = new Map<string, number>();
  for (const item of rawItems) {
    const id = typeof item?.id === "string" ? item.id : "";
    const qty = item?.qty;
    if (!id || !Number.isInteger(qty) || qty < 1 || qty > 99) {
      return NextResponse.json({ ok: false, error: "items" }, { status: 400 });
    }
    qtyById.set(id, (qtyById.get(id) ?? 0) + qty);
  }
  if (!qtyById.size) return NextResponse.json({ ok: false, error: "empty" }, { status: 400 });

  const catalog = await loadPublicCatalog();
  if (catalog.status !== "ready") return NextResponse.json({ ok: false, error: "catalog" }, { status: 503 });

  let subtotal = 0;
  const lines: { id: string; qty: number; price: number }[] = [];
  const purchases: number[] = [];
  for (const [id, qty] of qtyById) {
    const price = resolvePrice(catalog.catalog.products, id);
    if (price == null || price < 0) return NextResponse.json({ ok: false, error: "price" }, { status: 400 });
    subtotal += price * qty;
    lines.push({ id, qty, price });
    if (isGiftLine(id)) {
      for (let copy = 0; copy < qty; copy += 1) purchases.push(price);
    }
  }
  subtotal = Math.round(subtotal * 100) / 100;

  const coupon = typeof body?.coupon === "string" ? body.coupon.trim() : "";
  const giftCode = typeof body?.giftCard === "string" ? body.giftCard.trim() : "";

  const digital = lines.every((line) => isGiftLine(line.id));
  const shop = await loadShopShipping(request.headers.get("host"));
  const choice = shop.methods.find((method) => method.name === shippingName);
  if (!choice) return NextResponse.json({ ok: false, error: "shipping", message: "אפשרות המשלוח לא זמינה" }, { status: 400 });
  if (!digital && (!city || (!isPickupZone(choice.zone) && !street))) {
    return NextResponse.json({ ok: false, error: "missing" }, { status: 400 });
  }

  const quotedLines = storefrontLines(catalog.catalog.products, lines);
  if (!quotedLines.ok) return NextResponse.json({ ok: false, error: "price", message: "המוצר לא זמין להזמנה" }, { status: 400 });
  const quoted = await quoteCheckout({
    hostHeader: request.headers.get("host"),
    shippingName: choice.name,
    lines: quotedLines.lines,
    code: coupon,
    customerEmail: email,
    giftCode,
  });
  if (!quoted.ok) return NextResponse.json({ ok: false, error: "quote", message: quoted.reason }, { status: 400 });
  const payable = quoted.total;
  let gift = 0;
  let issued: { code: string; amount: number }[] = [];
  let orderNumber = "";
  const placedProducts = quoted.lines.length > 0;
  let orderShipping = quoted.shipping ?? 0;
  let orderDiscount = quoted.discount;
  let orderTotal = payable;
  if (placedProducts) {
    const placed = await placeStorefrontOrder({
      lines: quoted.lines,
      name,
      email,
      phone,
      street,
      city,
      zip,
      shippingName: choice.name,
      code: quoted.bundleBlocked ? "" : coupon,
      giftCode,
      hostname: await storefrontHost(request.headers.get("host")),
    });
    if (!placed.ok) return NextResponse.json({ ok: false, error: "order", message: placed.reason }, { status: 400 });
    orderNumber = placed.order.orderNumber;
    const waived = quoted.saleLocked
      ? { shipping: placed.order.shipping, total: placed.order.total }
      : shippingAfterFreeThreshold(subtotal, placed.order.shipping, placed.order.total);
    orderShipping = waived.shipping ?? placed.order.shipping;
    orderDiscount = placed.order.discount;
    orderTotal = waived.total;
    try {
      await trackPurchase(orderTotal);
    } catch (error) {
      console.error("purchase event failed", error instanceof Error ? error.name : "Error");
    }
  }
  if (purchases.length || (giftCode && !placedProducts)) {
    const settled = await settleGiftCards({
      name,
      email,
      phone,
      street,
      city,
      zip,
      shippingName: choice.name,
      code: placedProducts ? "" : giftCode,
      payable,
      purchases,
    });
    if (!settled.ok) return NextResponse.json({ ok: false, error: "gift", message: settled.reason }, { status: 400 });
    gift = Math.round((settled.applied ?? 0) * 100) / 100;
    issued = settled.issued ?? [];
    if (!orderNumber && settled.orderNumber) orderNumber = String(settled.orderNumber);
  }

  return NextResponse.json({
    ok: true,
    orderId: orderNumber || String(Date.now()),
    orderNumber: orderNumber || undefined,
    subtotal,
    shipping: orderShipping,
    discount: orderDiscount,
    gift,
    total: orderTotal,
    lines,
    issued,
  });
}
