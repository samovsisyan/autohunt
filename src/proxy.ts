import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { SESSION_COOKIE, verifySession } from "@/server/auth/token";

const LOCALE_COOKIE = "NEXT_LOCALE";

/** The language the visitor last chose on the site, otherwise Armenian (browser language is ignored). */
function preferredLocale(req: NextRequest): Locale {
  const fromCookie = req.cookies.get(LOCALE_COOKIE)?.value;
  return isLocale(fromCookie) ? fromCookie : defaultLocale;
}

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

  // ── No locale prefix → redirect to the preferred one (e.g. /dashboard → /hy/dashboard) ──
  if (!isLocale(first)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${preferredLocale(req)}${pathname === "/" ? "" : pathname}`;
    // Temporary: the target depends on the visitor's cookie, so browsers must not cache it.
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

  const res = NextResponse.next();
  if (req.cookies.get(LOCALE_COOKIE)?.value !== first) {
    res.cookies.set(LOCALE_COOKIE, first, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return res;
}

export const config = {
  matcher: [
    // Everything except API routes, Next internals, metadata files and static assets
    "/((?!api|_next|images|uploads|docs|favicon.ico|icon|apple-icon|opengraph-image|sitemap.xml|robots.txt|manifest.webmanifest|.*\\.[\\w]+$).*)",
  ],
};

