import { after, NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { ensureVisitor, trackPageView, VISITOR_COOKIE, visitorCookieOptions } from "@/lib/storely";

function photosProCatalogRequest(request: NextRequest) {
  if (request.nextUrl.pathname !== "/products") return false;
  if (request.method === "POST") return true;
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  if (request.headers.has("x-api-key")) return true;
  const accept = request.headers.get("accept") ?? "";
  return accept.includes("application/json") && !accept.includes("text/html") && request.headers.get("rsc") !== "1";
}

export async function middleware(request: NextRequest) {
  if (photosProCatalogRequest(request)) {
    const url = request.nextUrl.clone();
    url.pathname = "/api/photospro/products";
    return NextResponse.rewrite(url);
  }

  const visitor = ensureVisitor(request);
  request.headers.set("x-storely-path", request.nextUrl.pathname);
  request.headers.set("x-storely-visitor", visitor.key);
  const response = await updateSession(request);
  if (visitor.isNew) response.cookies.set(VISITOR_COOKIE, visitor.key, visitorCookieOptions());
  after(() => trackPageView(request, response));
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|ico)$).*)"],
};
