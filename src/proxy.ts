import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * DEV-ONLY optimistic route guard. Next.js 16 renamed `middleware.ts` to
 * `proxy.ts` (see node_modules/next/dist/docs/01-app/03-api-reference/
 * 03-file-conventions/proxy.md) — this is that file, not a leftover.
 *
 * There is no backend, so this only checks for the presence of a plain,
 * unsigned cookie set client-side by `src/lib/session.ts` at login/register
 * (`stayo_dev_session`) or by the homepage's "See a live preview" CTA
 * (`stayo_preview`). This is an optimistic check per Next's own auth guide
 * ("Optimistic checks with Proxy") — it is not a real authorization
 * boundary and must be replaced with a verified, signed session before
 * production.
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("stayo_dev_session");
  const hasPreview = request.cookies.has("stayo_preview");

  if (hasSession || hasPreview) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/app/:path*", "/onboarding/:path*"],
};
