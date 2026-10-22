import "server-only";
import { cookies, headers } from "next/headers";
import { after } from "next/server";
import {
  VISITOR_COOKIE,
  createVisitorKey,
  recordStorefrontEvent,
  requestHostname,
  validVisitorKey,
  visitorCookieOptions,
  type StorefrontEventName,
} from "@/lib/storely";

function decodePath(value: string | null) {
  if (!value) return "";
  try {
    return decodeURI(value);
  } catch {
    return value;
  }
}

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

  const jar = await cookies();
  const snapshot = {
    host: headerList.get("host"),
    visitorHeader: headerList.get("x-storely-visitor"),
    visitorCookie: jar.get(VISITOR_COOKIE)?.value ?? null,
    nextUrl: headerList.get("next-url"),
    referer: headerList.get("referer"),
    pathHeader: headerList.get("x-storely-path"),
    country: headerList.get("x-vercel-ip-country"),
    city: headerList.get("x-vercel-ip-city"),
  };

  after(() => recordRenderedPageView(snapshot));
}

function recordRenderedPageView(snapshot: {
  host: string | null;
  visitorHeader: string | null;
  visitorCookie: string | null;
  nextUrl: string | null;
  referer: string | null;
  pathHeader: string | null;
  country: string | null;
  city: string | null;
}) {
  const hostname = requestHostname(snapshot.host);
  const visitorKey = validVisitorKey(snapshot.visitorHeader)
    ? snapshot.visitorHeader
    : validVisitorKey(snapshot.visitorCookie)
      ? snapshot.visitorCookie
      : createVisitorKey();
  if (!validVisitorKey(snapshot.visitorHeader) && !validVisitorKey(snapshot.visitorCookie)) {
    console.error("Storely page_view visitor cookie was missing on the page render");
  }
  const headerList = new Headers();
  if (snapshot.nextUrl) headerList.set("next-url", snapshot.nextUrl);
  if (snapshot.referer) headerList.set("referer", snapshot.referer);
  const path = decodePath(snapshot.pathHeader) || requestPath(headerList, "/");
  const country = place(snapshot.country);
  const city = place(snapshot.city);
  return recordStorefrontEvent({
    eventName: "page_view",
    hostname,
    visitorKey,
    path,
    country,
    city,
  }).then(() => {
    if (path !== "/checkout") return;
    return recordStorefrontEvent({
      eventName: "begin_checkout",
      hostname,
      visitorKey,
      path,
      country,
      city,
    });
  }).catch((error) => {
    console.error("Storely event failed", error instanceof Error ? error.name : "Error");
  });
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
