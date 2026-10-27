import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { loadPublicCatalog } from "@/lib/catalog";
import { parseShopQuiz } from "@/lib/shop-quiz";
import { parseShopPopups } from "@/lib/store-popups";
import { requestHostname } from "@/lib/storely";
import type { ShippingChoice } from "@/lib/shipping";

export type StoreLine = { variantId: string; quantity: number; bundle?: boolean; bundleQty?: number };

export type ShopShipping = {
  currency: string;
  methods: ShippingChoice[];
};

type Quote =
  | {
      ok: true;
      total: number;
      currency: string;
      shipping: number | null;
      discount: number;
      discountCode: string;
      addGift: boolean;
      bundleBlocked: boolean;
      giftVariantId: string;
      giftQuantity: number;
      giftTitle: string;
    }
  | { ok: false; reason: string };

const VARIANT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function storelyEnv() {
  const url = (process.env.STORELY_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim().replace(/\/$/, "");
  const key = (process.env.STORELY_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)?.trim();
  const trackingKey = process.env.STORELY_TRACKING_KEY?.trim();
  if (!url || !key || !trackingKey) {
    const missing = [
      ["STORELY_SUPABASE_URL", url],
      ["STORELY_PUBLISHABLE_KEY", key],
      ["STORELY_TRACKING_KEY", trackingKey],
    ].filter(([, value]) => !value).map(([name]) => name);
    console.error(`Storely shop was not loaded: missing ${missing.join(", ")}`);
    return null;
  }
  return { url, key, trackingKey };
}

function readRecord(payload: unknown): Record<string, unknown> | null {
  let value = payload;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value && typeof value === "object" ? value as Record<string, unknown> : null;
}

function amount(value: unknown) {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(number) ? Math.round(number * 100) / 100 : null;
}

function currencyCode(value: unknown) {
  const code = typeof value === "string" ? value.trim().toUpperCase() : "";
  return code === "ILS" || code === "USD" || code === "EUR" ? code : "";
}

function reasonOf(record: Record<string, unknown> | null) {
  const reason = typeof record?.reason === "string" ? record.reason.trim() : "";
  if (reason) return reason;
  const message = typeof record?.message === "string" ? record.message.trim() : "";
  return message;
}

async function storelyRpc(name: string, body: Record<string, unknown>) {
  const env = storelyEnv();
  if (!env) return { env: null, record: null, responseOk: false };
  let response: Response;
  try {
    response = await fetch(`${env.url}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: {
        apikey: env.key,
        authorization: `Bearer ${env.key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { env, record: null, responseOk: false };
  }
  const record = readRecord(await response.json().catch(() => null));
  return { env, record, responseOk: response.ok };
}

function shippingChoices(record: Record<string, unknown> | null): ShopShipping {
  const rows = record && Array.isArray(record.shipping) ? record.shipping : [];
  const methods: ShippingChoice[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const item = row as Record<string, unknown>;
    const name = typeof item.name === "string" ? item.name.trim() : "";
    const price = amount(item.price);
    const zone = typeof item.zone === "string" ? item.zone.trim() : "";
    if (!name || price == null || price < 0) continue;
    methods.push({ name, price, zone });
  }
  const fromItems = rows.find((row) => row && typeof row === "object" && currencyCode((row as Record<string, unknown>).currency));
  const currency = currencyCode(record?.currency)
    || (fromItems && typeof fromItems === "object" ? currencyCode((fromItems as Record<string, unknown>).currency) : "")
    || "ILS";
  return { currency, methods };
}

const LOCAL_HOST = /^(localhost|127\.0\.0\.1)$/;

export async function storefrontHost(hostHeader: string | null) {
  const requested = requestHostname(hostHeader);
  if (requested && !LOCAL_HOST.test(requested)) return requested;
  const catalog = await loadPublicCatalog();
  const storeHost = catalog.status === "ready" ? requestHostname(catalog.catalog.hostname) : "";
  return storeHost || requested;
}

async function shopRecord(hostname: string) {
  const env = storelyEnv();
  if (!env || !hostname) return { record: null, responseOk: false };
  return storelyRpc("storefront_shop", {
    tracking_key: env.trackingKey,
    hostname,
  });
}

const readShopContent = unstable_cache(
  async (hostname: string) => {
    const { record, responseOk } = await shopRecord(hostname);
    if (!responseOk || record?.ok !== true) throw new Error("Storely shop unavailable");
    return { popups: record.popups ?? [], posts: Array.isArray(record.posts) ? record.posts : [], quiz: record.quiz ?? null };
  },
  ["storely-shop-content-v2"],
  { revalidate: 60 },
);

const loadShopContent = cache(async (hostname: string) => {
  try {
    return await readShopContent(hostname);
  } catch {
    return null;
  }
});

export async function loadShopShipping(hostHeader: string | null): Promise<ShopShipping> {
  const hostname = await storefrontHost(hostHeader);
  const env = storelyEnv();
  if (!env || !hostname) return { currency: "ILS", methods: [] };
  let { record, responseOk } = await shopRecord(hostname);
  if ((!responseOk || record?.ok !== true) && !LOCAL_HOST.test(requestHostname(hostHeader))) {
    const catalog = await loadPublicCatalog();
    const storeHost = catalog.status === "ready" ? requestHostname(catalog.catalog.hostname) : "";
    if (storeHost && storeHost !== hostname) {
      const retry = await shopRecord(storeHost);
      record = retry.record;
      responseOk = retry.responseOk;
    }
  }
  if (!responseOk || record?.ok !== true) {
    console.error(`Storely shop was not loaded: host "${hostname}"`);
    return { currency: currencyCode(record?.currency) || "ILS", methods: [] };
  }
  return shippingChoices(record);
}

export async function quoteStorefront(input: {
  hostHeader: string | null;
  shippingName: string;
  lines: StoreLine[];
  code: string;
  customerEmail: string;
  giftCode: string;
}): Promise<Quote> {
  const hostname = await storefrontHost(input.hostHeader);
  const env = storelyEnv();
  if (!env || !hostname) return { ok: false, reason: "לא הצלחנו לחשב את הסכום לתשלום" };
  const { record, responseOk } = await storelyRpc("quote_storefront", {
    tracking_key: env.trackingKey,
    hostname,
    lines: input.lines,
    code: input.code,
    customer_email: input.customerEmail,
    gift_code: input.giftCode,
    shipping_name: input.shippingName,
  });
  const total = amount(record?.total);
  if (!responseOk || record?.ok !== true || total == null || total < 0) {
    return { ok: false, reason: reasonOf(record) || "לא הצלחנו לחשב את הסכום לתשלום" };
  }
  const discountCode = typeof record.discountCode === "string" ? record.discountCode.trim() : "";
  const giftQuantity = typeof record.giftQuantity === "number" ? record.giftQuantity : Number(record.giftQuantity);
  const giftVariantId = typeof record.giftVariantId === "string" ? record.giftVariantId.trim() : "";
  return {
    ok: true,
    total,
    currency: currencyCode(record.currency) || "ILS",
    shipping: amount(record.shipping),
    discount: amount(record.discount) ?? 0,
    discountCode,
    addGift: record.addGift === true,
    bundleBlocked: record.bundleBlocked === true,
    giftVariantId,
    giftQuantity: Number.isInteger(giftQuantity) ? giftQuantity : 0,
    giftTitle: typeof record.giftTitle === "string" ? record.giftTitle.trim() : "",
  };
}

function withGiftLine(lines: StoreLine[], variantId: string, quantity: number) {
  const next = lines.map((line) => ({ ...line }));
  const found = next.find((line) => line.variantId === variantId && line.bundle !== true);
  if (found) found.quantity += quantity;
  else next.push({ variantId, quantity });
  return next;
}

export type SettledQuote =
  | {
      ok: true;
      total: number;
      currency: string;
      shipping: number | null;
      discount: number;
      discountCode: string;
      bundleBlocked: boolean;
      lines: StoreLine[];
      addedGift: { variantId: string; quantity: number; title: string } | null;
    }
  | { ok: false; reason: string };

export async function quoteCheckout(input: {
  hostHeader: string | null;
  shippingName: string;
  lines: StoreLine[];
  code: string;
  customerEmail: string;
  giftCode: string;
}): Promise<SettledQuote> {
  const quoted = await quoteStorefront(input);
  if (!quoted.ok) return quoted;
  if (quoted.bundleBlocked) {
    return {
      ok: true,
      total: quoted.total,
      currency: quoted.currency,
      shipping: quoted.shipping,
      discount: 0,
      discountCode: "",
      bundleBlocked: true,
      lines: input.lines,
      addedGift: null,
    };
  }
  if (!quoted.addGift) {
    return {
      ok: true,
      total: quoted.total,
      currency: quoted.currency,
      shipping: quoted.shipping,
      discount: quoted.discount,
      discountCode: quoted.discountCode,
      bundleBlocked: false,
      lines: input.lines,
      addedGift: null,
    };
  }
  if (!VARIANT_ID.test(quoted.giftVariantId) || quoted.giftQuantity < 1 || quoted.giftQuantity > 99) {
    return { ok: false, reason: "לא הצלחנו להוסיף את המוצר במתנה" };
  }
  const lines = withGiftLine(input.lines, quoted.giftVariantId, quoted.giftQuantity);
  if (lines.some((line) => line.quantity > 99) || lines.length > 30) {
    return { ok: false, reason: "לא הצלחנו להוסיף את המוצר במתנה" };
  }
  const again = await quoteStorefront({ ...input, lines });
  if (!again.ok) return again;
  if (again.bundleBlocked) {
    return {
      ok: true,
      total: quoted.total,
      currency: quoted.currency,
      shipping: quoted.shipping,
      discount: 0,
      discountCode: "",
      bundleBlocked: true,
      lines: input.lines,
      addedGift: null,
    };
  }
  return {
    ok: true,
    total: again.total,
    currency: again.currency,
    shipping: again.shipping,
    discount: again.discount,
    discountCode: again.discountCode,
    bundleBlocked: false,
    lines,
    addedGift: { variantId: quoted.giftVariantId, quantity: quoted.giftQuantity, title: quoted.giftTitle },
  };
}

export type ShopPostMedia = { handle: string; video: string; body: string; image: string; imageX: number; imageY: number; imageScale: number };

function postVideo(value: unknown) {
  const url = typeof value === "string" ? value.trim() : "";
  return /^https:\/\/.+\.(mp4|webm|mov)(\?.*)?$/i.test(url) ? url.slice(0, 500) : "";
}

function postImage(value: unknown) {
  const url = typeof value === "string" ? value.trim() : "";
  return /^https:\/\/\S+$/i.test(url) ? url.slice(0, 800) : "";
}

function postZoom(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number) || number <= 0) return 1;
  return Math.min(3, Math.round(number * 100) / 100);
}

function postFocus(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return 50;
  return Math.min(100, Math.max(0, Math.round(number)));
}

export async function loadShopQuiz(hostHeader: string | null) {
  const hostname = await storefrontHost(hostHeader);
  if (!hostname) return null;
  const content = await loadShopContent(hostname);
  return content ? parseShopQuiz(content.quiz) : null;
}

export async function loadShopPopups(hostHeader: string | null) {
  const hostname = await storefrontHost(hostHeader);
  if (!hostname) return [];
  const content = await loadShopContent(hostname);
  return content ? parseShopPopups(content.popups) : [];
}

export async function submitPopupLead(input: {
  hostHeader: string | null;
  popupId: string;
  fields: Record<string, unknown>;
  pagePath: string;
}) {
  const hostname = await storefrontHost(input.hostHeader);
  const env = storelyEnv();
  if (!env || !hostname) return { ok: false as const, reason: "לא הצלחנו לשלוח" };
  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(input.fields)) {
    if (!/^[a-z][a-z0-9_]{0,31}$/.test(key) || typeof value !== "string") continue;
    const clean = value.trim().slice(0, 400);
    if (clean) fields[key] = clean;
    if (Object.keys(fields).length >= 8) break;
  }
  const pagePath = input.pagePath.trim().split("?")[0]?.split("#")[0] || "/";
  const { record, responseOk } = await storelyRpc("submit_store_popup_lead", {
    tracking_key: env.trackingKey,
    hostname,
    popup_id: input.popupId,
    fields,
    page_path: pagePath.startsWith("/") && !pagePath.startsWith("//") ? pagePath.slice(0, 200) : "/",
  });
  if (!responseOk || record?.ok !== true) {
    const reason = typeof record?.reason === "string" ? record.reason : "לא הצלחנו לשלוח";
    return { ok: false as const, reason };
  }
  return { ok: true as const };
}

const CHECKOUT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function textField(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function localPhone(value: unknown) {
  const raw = textField(value);
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("972") && digits.length >= 11) return `0${digits.slice(3, 12)}`;
  return raw;
}

export async function loadRecoveredCheckout(hostHeader: string | null, checkoutId: string) {
  const id = checkoutId.trim();
  if (!CHECKOUT_ID.test(id)) return null;
  const env = storelyEnv();
  const hostname = await storefrontHost(hostHeader);
  if (!env || !hostname) return null;
  const { record, responseOk } = await storelyRpc("recover_storefront_checkout", {
    tracking_key: env.trackingKey,
    hostname,
    checkout_id: id,
  });
  if (!responseOk || record?.ok !== true || !Array.isArray(record.lines)) return null;
  const lines = record.lines.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const item = row as Record<string, unknown>;
    const lineId = textField(item.id);
    const name = textField(item.name);
    const qty = typeof item.qty === "number" ? item.qty : Number(item.qty);
    const price = typeof item.price === "number" ? item.price : Number(item.price);
    if (!CHECKOUT_ID.test(lineId) || !name || !Number.isInteger(qty) || qty < 1 || !Number.isFinite(price) || price < 0) return [];
    return [{
      id: lineId,
      name,
      sub: typeof item.sub === "string" ? item.sub : "",
      price,
      image: typeof item.image === "string" && item.image.startsWith("http") ? item.image : null,
      qty,
    }];
  });
  if (!lines.length) return null;
  const name = textField(record.name);
  const email = textField(record.email);
  const phone = localPhone(record.phone);
  const city = textField(record.city);
  const street = textField(record.street);
  const zip = textField(record.zip);
  const customer = name || email || phone || city || street || zip ? { name, phone, email, city, street, zip } : null;
  return { lines, customer };
}

export async function loadShopPosts(hostHeader: string | null): Promise<ShopPostMedia[]> {
  const hostname = await storefrontHost(hostHeader);
  if (!hostname) return [];
  const content = await loadShopContent(hostname);
  if (!content) return [];
  return content.posts.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const item = row as Record<string, unknown>;
    const handle = typeof item.handle === "string" ? item.handle.trim() : "";
    const video = postVideo(item.video);
    const body = typeof item.body === "string" ? item.body : "";
    const image = postImage(item.image);
    if (!handle || item.visible === false || (!video && !body.trim() && !image)) return [];
    return [{ handle, video, body, image, imageX: postFocus(item.imageX), imageY: postFocus(item.imageY), imageScale: postZoom(item.imageScale) }];
  });
}
