import { after, NextResponse, type NextRequest } from "next/server";
import { articleRedirectPath, articleSlugForPath, normalizeArticlePath } from "@/lib/article-paths";
import { legacyProductRedirect, productPageRewrite } from "@/lib/catalog-model";
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
  const publicPath = normalizeArticlePath(request.nextUrl.pathname);
  request.headers.set("x-storely-path", encodeURI(publicPath));
  request.headers.set("x-storely-visitor", visitor.key);
  const response = await updateSession(request);
  if (visitor.isNew) response.cookies.set(VISITOR_COOKIE, visitor.key, visitorCookieOptions());
  after(() => trackPageView(request, response));

  if (request.headers.get("x-article-internal") === "1" || request.headers.get("x-product-internal") === "1") return response;

  const legacyProduct = legacyProductRedirect(publicPath);
  if (legacyProduct) {
    const url = request.nextUrl.clone();
    url.pathname = legacyProduct;
    return carryCookies(response, NextResponse.redirect(url, 308));
  }

  const productInternal = productPageRewrite(publicPath);
  if (productInternal) {
    const url = request.nextUrl.clone();
    url.pathname = productInternal;
    const headers = new Headers(request.headers);
    headers.set("x-product-internal", "1");
    headers.set("x-storely-path", encodeURI(publicPath));
    return carryCookies(response, NextResponse.rewrite(url, { request: { headers } }));
  }

  const redirectPath = articleRedirectPath(publicPath);
  if (redirectPath && redirectPath !== publicPath) {
    const url = request.nextUrl.clone();
    url.pathname = redirectPath;
    return carryCookies(response, NextResponse.redirect(url, 308));
  }

  const articleSlug = articleSlugForPath(publicPath);
  if (articleSlug) {
    const url = request.nextUrl.clone();
    url.pathname = `/articles/${articleSlug}`;
    const headers = new Headers(request.headers);
    headers.set("x-article-internal", "1");
    headers.set("x-storely-path", encodeURI(publicPath));
    return carryCookies(response, NextResponse.rewrite(url, { request: { headers } }));
  }

  if (publicPath === "/מאמרים") {
    const url = request.nextUrl.clone();
    url.pathname = "/articles";
    const headers = new Headers(request.headers);
    headers.set("x-article-internal", "1");
    return carryCookies(response, NextResponse.rewrite(url, { request: { headers } }));
  }

  return response;
}

function carryCookies(from: NextResponse, to: NextResponse) {
  for (const cookie of from.cookies.getAll()) to.cookies.set(cookie);
  return to;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|ico)$).*)"],
};
