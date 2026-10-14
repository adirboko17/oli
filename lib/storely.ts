import { NextResponse, type NextRequest } from "next/server";

const ALLOWED_HOST = "oli-eosin.vercel.app";
export const VISITOR_COOKIE = "storely_visitor";
const VISITOR_KEY = /^[A-Za-z0-9_-]{16,80}$/;

export function visitorCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };
}

export function validVisitorKey(value: string | undefined | null): value is string {
  return !!value && VISITOR_KEY.test(value);
}

export function createVisitorKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

const EVENTS = ["page_view", "product_view", "add_to_cart", "begin_checkout", "purchase"] as const;
export type StorefrontEventName = (typeof EVENTS)[number];

type StorefrontEvent = {
  eventName: StorefrontEventName;
  hostname: string;
  visitorKey: string;
  path: string;
  country: string;
  city: string;
  amount?: number;
};

export function requestHostname(hostHeader: string | null): string {
  const host = hostHeader?.split(",")[0]?.trim().toLowerCase() ?? "";
  return host.replace(/:\d+$/, "");
}

export function isStorelyHost(hostname: string): boolean {
  return hostname === ALLOWED_HOST;
}

function isPrefetch(request: NextRequest): boolean {
  if (request.headers.get("next-router-prefetch") === "1") return true;
  if (request.headers.get("x-middleware-prefetch") === "1") return true;
  const purpose = `${request.headers.get("purpose") ?? ""} ${request.headers.get("sec-purpose") ?? ""}`;
  return purpose.includes("prefetch");
}

function visitorKey(request: NextRequest): { key: string; isNew: boolean } {
  const current = request.cookies.get(VISITOR_COOKIE)?.value;
  if (validVisitorKey(current)) return { key: current, isNew: false };
  return { key: createVisitorKey(), isNew: true };
}

function placeName(value: string | null): string {
  const raw = value?.trim() ?? "";
  if (!raw) return "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function eventBody(event: StorefrontEvent, trackingKey: string): Record<string, string | number> {
  const body: Record<string, string | number> = {
    tracking_key: trackingKey,
    hostname: event.hostname,
    visitor_key: event.visitorKey,
    event_name: event.eventName,
    path: event.path.split("?")[0]?.split("#")[0] || "/",
    country: event.country,
    city: event.city,
  };
  if (event.eventName === "purchase" && Number.isFinite(event.amount)) {
    body.amount = event.amount as number;
  }
  return body;
}

export async function recordStorefrontEvent(event: StorefrontEvent): Promise<void> {
  const base = process.env.STORELY_SUPABASE_URL?.replace(/\/$/, "");
  const publishableKey = process.env.STORELY_PUBLISHABLE_KEY;
  const trackingKey = process.env.STORELY_TRACKING_KEY;
  if (!base || !publishableKey || !trackingKey || !isStorelyHost(event.hostname)) return;
  if (!EVENTS.includes(event.eventName) || !VISITOR_KEY.test(event.visitorKey)) return;

  const response = await fetch(`${base}/rest/v1/rpc/record_storefront_event`, {
    method: "POST",
    headers: {
      apikey: publishableKey,
      authorization: `Bearer ${publishableKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(eventBody(event, trackingKey)),
    signal: AbortSignal.timeout(2000),
  });
  if (!response.ok) {
    console.error("Storely event was not recorded", response.status);
  }
}

export async function trackPageView(request: NextRequest, response: NextResponse): Promise<void> {
  if (request.method !== "GET" || isPrefetch(request)) return;
  if (response.status >= 300 && response.status < 400) return;

  const hostname = requestHostname(request.headers.get("host"));
  if (!isStorelyHost(hostname)) return;

  const visitor = visitorKey(request);
  if (visitor.isNew) {
    response.cookies.set(VISITOR_COOKIE, visitor.key, visitorCookieOptions());
  }

  const country = placeName(request.headers.get("x-vercel-ip-country"));
  const city = placeName(request.headers.get("x-vercel-ip-city"));
  const path = request.nextUrl.pathname;
  try {
    await recordStorefrontEvent({
      eventName: "page_view",
      hostname,
      visitorKey: visitor.key,
      path,
      country,
      city,
    });
    if (path === "/checkout") {
      await recordStorefrontEvent({
        eventName: "begin_checkout",
        hostname,
        visitorKey: visitor.key,
        path,
        country,
        city,
      });
    }
  } catch (error) {
    console.error("Storely event failed", error instanceof Error ? error.name : "Error");
  }
}
