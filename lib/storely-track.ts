import "server-only";
import { cookies, headers } from "next/headers";
import {
  VISITOR_COOKIE,
  createVisitorKey,
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

export async function trackRenderedPageView() {
  const headerList = await headers();
  if (headerList.get("next-router-prefetch") === "1") return;
  if (headerList.get("next-router-segment-prefetch")) return;
  const purpose = `${headerList.get("purpose") ?? ""} ${headerList.get("sec-purpose") ?? ""}`;
  if (purpose.includes("prefetch")) return;

  const hostname = requestHostname(headerList.get("host"));
  const jar = await cookies();
  const visitorKey = validVisitorKey(headerList.get("x-storely-visitor"))
    ? headerList.get("x-storely-visitor")!
    : validVisitorKey(jar.get(VISITOR_COOKIE)?.value)
      ? jar.get(VISITOR_COOKIE)!.value
      : createVisitorKey();
  if (!validVisitorKey(headerList.get("x-storely-visitor")) && !validVisitorKey(jar.get(VISITOR_COOKIE)?.value)) {
    console.error("Storely page_view visitor cookie was missing on the page render");
  }
  const path = headerList.get("x-storely-path") || requestPath(headerList, "/");
  const country = place(headerList.get("x-vercel-ip-country"));
  const city = place(headerList.get("x-vercel-ip-city"));
  try {
    await recordStorefrontEvent({
      eventName: "page_view",
      hostname,
      visitorKey,
      path,
      country,
      city,
    });
    if (path === "/checkout") {
      await recordStorefrontEvent({
        eventName: "begin_checkout",
        hostname,
        visitorKey,
        path,
        country,
        city,
      });
    }
  } catch (error) {
    console.error("Storely event failed", error instanceof Error ? error.name : "Error");
  }
}

export async function trackVisitorEvent(eventName: StorefrontEventName, path?: string, amount?: number) {
  const headerList = await headers();
  const hostname = requestHostname(headerList.get("host"));

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
