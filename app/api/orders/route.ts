import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { loadPublicCatalog } from "@/lib/catalog";
import { giftAmountsFromTags, OPEN_GIFT_MAX, openGiftMax, type CatalogProduct } from "@/lib/catalog-model";
import { settleGiftCards } from "@/lib/gift-cards";
import { consumePromo, promoPercent } from "@/lib/promo-leads";
import { createVisitorKey, validVisitorKey, VISITOR_COOKIE, visitorCookieOptions } from "@/lib/storely";
import { trackPurchase } from "@/lib/storely-actions";

const FREE_FROM = 250;
const SHIPPING = { home: 29, pickup: 19 } as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^05\d{8}$/;
const STORE_HOST = "oli-eosin.vercel.app";

type StoreLine = { variantId: string; quantity: number };
type PlacedOrder = { orderNumber: string; total: number; shipping: number; discount: number };

type Method = keyof typeof SHIPPING;

function giftAmount(raw: string) {
  const amount = Math.round(Number(raw) * 100) / 100;
  return Number.isFinite(amount) ? amount : null;
}

function resolvePrice(products: CatalogProduct[], id: string) {
  const card = /^oli-gift:(\d+(?:\.\d+)?)$/.exec(id);
  if (card) {
    const amount = giftAmount(card[1]);
    if (amount == null || amount < 50 || amount > OPEN_GIFT_MAX) return null;
    return amount;
  }
  const gift = /^(.*):gift:(\d+(?:\.\d+)?)$/.exec(id);
  if (gift) {
    const amount = giftAmount(gift[2]);
    const product = products.find((item) => item.id === gift[1]);
    if (!product || amount == null) return null;
    const preset = giftAmountsFromTags(product.tags).includes(amount);
    const max = openGiftMax(product.tags);
    const custom = max != null && amount >= 1 && amount <= max;
    if (!preset && !custom) return null;
    return amount;
  }
  const bundle = /^(.+):x(\d+)$/.exec(id);
  const baseId = bundle?.[1] ?? id;
  const bundleQty = bundle ? Number(bundle[2]) : null;
  for (const product of products) {
    const variant = product.variants.find((item) => item.id === baseId);
    if (product.id !== baseId && !variant) continue;
    if (bundleQty) {
      const pack = product.bundles.find((item) => item.qty === bundleQty);
      return pack ? pack.price : null;
    }
    return variant?.price ?? product.price;
  }
  return null;
}

function skippedStoreLine(id: string) {
  return id.startsWith("oli-gift:") || id.includes(":gift:") || /:x\d+$/.test(id);
}

function variantForLine(products: CatalogProduct[], id: string) {
  for (const product of products) {
    const variant = product.variants.find((item) => item.id === id);
    if (variant) return variant.id;
  }
  const product = products.find((item) => item.id === id);
  return product?.variants[0]?.id ?? null;
}

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
        hostname: STORE_HOST,
        visitor_key: visitorKey,
        lines: input.lines,
        customer_name: input.name,
        customer_email: input.email,
        customer_phone: input.phone,
        customer_street: input.street,
        customer_city: input.city,
        customer_zip: input.zip,
        shipping_name: "",
        code: "",
        gift_code: "",
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
  const method = body?.method === "pickup" ? "pickup" : body?.method === "home" ? "home" : null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.replace(/\D/g, "") : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const city = typeof body?.city === "string" ? body.city.trim() : "";
  const street = typeof body?.street === "string" ? body.street.trim() : "";
  const zip = typeof body?.zip === "string" ? body.zip.trim() : "";
  const rawItems = Array.isArray(body?.items) ? body.items : [];
  if (!method || !name || !PHONE_RE.test(phone) || !EMAIL_RE.test(email) || !city || (method === "home" && !street)) {
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
    if (/^oli-gift:/.test(id) || /:gift:/.test(id)) {
      for (let copy = 0; copy < qty; copy += 1) purchases.push(price);
    }
  }
  subtotal = Math.round(subtotal * 100) / 100;

  const coupon = typeof body?.coupon === "string" ? body.coupon.trim().toUpperCase() : "";
  const giftCode = typeof body?.giftCard === "string" ? body.giftCard.trim() : "";
  const percent = coupon ? await promoPercent(coupon) : 0;
  if (coupon && !percent) return NextResponse.json({ ok: false, error: "coupon" }, { status: 400 });

  const digital = lines.every((line) => /^oli-gift:/.test(line.id) || /:gift:/.test(line.id));
  const shipping = digital || subtotal >= FREE_FROM ? 0 : SHIPPING[method as Method];
  const discount = percent ? Math.round(subtotal * percent) / 100 : 0;
  const payable = Math.round((subtotal + shipping - discount) * 100) / 100;
  if (coupon && !(await consumePromo(coupon))) return NextResponse.json({ ok: false, error: "coupon" }, { status: 400 });
  let gift = 0;
  let issued: { code: string; amount: number }[] = [];
  if (giftCode || purchases.length) {
    const settled = await settleGiftCards({ name, email, code: giftCode, payable, purchases });
    if (!settled.ok) return NextResponse.json({ ok: false, error: "gift", message: settled.reason }, { status: 400 });
    gift = Math.round((settled.applied ?? 0) * 100) / 100;
    issued = settled.issued ?? [];
  }
  const total = Math.round((payable - gift) * 100) / 100;

  const productLines = lines.filter((line) => !skippedStoreLine(line.id));
  const trial = productLines.length > 0 && productLines.every((line) => line.price === 0);
  const storeLines: StoreLine[] = [];
  if (trial) {
    for (const line of productLines) {
      const variantId = variantForLine(catalog.catalog.products, line.id);
      if (!variantId) {
        return NextResponse.json({ ok: false, error: "price", message: "המוצר לא זמין להזמנה" }, { status: 400 });
      }
      storeLines.push({ variantId, quantity: line.qty });
    }
  }

  let orderNumber = "";
  let orderShipping = shipping;
  let orderDiscount = discount;
  let orderTotal = total;
  if (trial && storeLines.length) {
    const placed = await placeStorefrontOrder({
      lines: storeLines,
      name,
      email,
      phone,
      street,
      city,
      zip,
    });
    if (!placed.ok) return NextResponse.json({ ok: false, error: "order", message: placed.reason }, { status: 400 });
    orderNumber = placed.order.orderNumber;
    orderShipping = placed.order.shipping;
    orderDiscount = placed.order.discount;
    orderTotal = placed.order.total;
    try {
      await trackPurchase(orderTotal);
    } catch (error) {
      console.error("purchase event failed", error instanceof Error ? error.name : "Error");
    }
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
