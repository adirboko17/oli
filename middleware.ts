import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { ensureVisitor, trackPageView, VISITOR_COOKIE, visitorCookieOptions } from "@/lib/storely";

export async function middleware(request: NextRequest) {
  const visitor = ensureVisitor(request);
  request.headers.set("x-storely-path", request.nextUrl.pathname);
  request.headers.set("x-storely-visitor", visitor.key);
  const response = await updateSession(request);
  if (visitor.isNew) response.cookies.set(VISITOR_COOKIE, visitor.key, visitorCookieOptions());
  await trackPageView(request, response);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|ico)$).*)"],
};
