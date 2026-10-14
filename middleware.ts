import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { trackPageView } from "@/lib/storely";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  await trackPageView(request, response);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|ico)$).*)"],
};
