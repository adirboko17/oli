import "server-only";
import { loadPublicCatalog } from "@/lib/catalog";
import { requestHostname } from "@/lib/storely";
import type { ShippingChoice } from "@/lib/shipping";

export type StoreLine = { variantId: string; quantity: number };

export type ShopShipping = {
  currency: string;
  methods: ShippingChoice[];
};

type Quote =
  | { ok: true; total: number; currency: string; shipping: number | null; discount: number; discountCode: string }
  | { ok: false; reason: string };

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
  return {
    ok: true,
    total,
    currency: currencyCode(record.currency) || "ILS",
    shipping: amount(record.shipping),
    discount: amount(record.discount) ?? 0,
    discountCode,
  };
}

export type ShopPostMedia = { handle: string; video: string };

function postVideo(value: unknown) {
  const url = typeof value === "string" ? value.trim() : "";
  return /^https:\/\/.+\.(mp4|webm|mov)(\?.*)?$/i.test(url) ? url.slice(0, 500) : "";
}

export async function loadShopPosts(hostHeader: string | null): Promise<ShopPostMedia[]> {
  const hostname = await storefrontHost(hostHeader);
  if (!hostname) return [];
  const { record, responseOk } = await shopRecord(hostname);
  if (!responseOk || record?.ok !== true || !Array.isArray(record.posts)) return [];
  return record.posts.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const item = row as Record<string, unknown>;
    const handle = typeof item.handle === "string" ? item.handle.trim() : "";
    const video = postVideo(item.video);
    if (!handle || !video || item.visible === false) return [];
    return [{ handle, video }];
  });
}
