import "server-only";
import { cookies, headers } from "next/headers";
import {
  VISITOR_COOKIE,
  createVisitorKey,
  isStorelyHost,
  recordStorefrontEvent,
  requestHostname,
  validVisitorKey,
  visitorCookieOptions,
  type StorefrontEventName,
} from "@/lib/storely";

function requestPath(headerList: Headers, fallback: string) {
  const nextUrl = headerList.get("next-url")?.split("?")[0]?.split("#")[0];
  if (nextUrl) return nextUrl || fallback;
  const referer = headerList.get("referer");
  if (referer) {
    try {
      return new URL(referer).pathname || fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export async function trackVisitorEvent(eventName: StorefrontEventName, path?: string, amount?: number) {
  const headerList = await headers();
  const hostname = requestHostname(headerList.get("host"));
  if (!isStorelyHost(hostname)) return;

  const jar = await cookies();
  let visitorKey = jar.get(VISITOR_COOKIE)?.value;
  if (!validVisitorKey(visitorKey)) {
    visitorKey = createVisitorKey();
    jar.set(VISITOR_COOKIE, visitorKey, visitorCookieOptions());
  }

  try {
    await recordStorefrontEvent({
      eventName,
      hostname,
      visitorKey,
      path: path || requestPath(headerList, "/"),
      country: place(headerList.get("x-vercel-ip-country")),
      city: place(headerList.get("x-vercel-ip-city")),
      amount,
    });
  } catch (error) {
    console.error("Storely event failed", error instanceof Error ? error.name : "Error");
  }
}

function place(value: string | null) {
  const raw = value?.trim() ?? "";
  if (!raw) return "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
