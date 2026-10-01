import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";
import { SESSION_COOKIE, verifySession } from "@/server/auth/token";

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // ── Admin: role-gated, not under a locale prefix (its language is a cookie) ──
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname === "/admin/login") return NextResponse.next();
    const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
    if (session?.role !== "ADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const first = pathname.split("/")[1];

  // ── No locale prefix → Armenian, always (e.g. / → /hy, /dashboard → /hy/dashboard).
  //    Visitors switch language with the header switcher; the URL then carries it. ──
  if (!isLocale(first)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
    // 307, not 308: browsers must not cache this, so changing the default later takes effect.
    return NextResponse.redirect(url, 307);
  }

  // ── Customer dashboard requires a session ──
  const rest = pathname.slice(first.length + 1);
  if (rest === "/dashboard" || rest.startsWith("/dashboard/")) {
    const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = `/${first}/login`;
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Everything except API routes, Next internals, metadata files and static assets
    "/((?!api|_next|images|uploads|docs|favicon.ico|icon|apple-icon|opengraph-image|sitemap.xml|robots.txt|manifest.webmanifest|.*\\.[\\w]+$).*)",
  ],
};

