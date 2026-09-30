import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { SESSION_COOKIE, verifySession } from "@/server/auth/token";

const LOCALE_COOKIE = "NEXT_LOCALE";

function preferredLocale(req: NextRequest): Locale {
  const fromCookie = req.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  const header = req.headers.get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return (ranked.find((r) => isLocale(r.lang))?.lang as Locale) ?? defaultLocale;
}

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // ── Admin: role-gated, English-only, not localized ──
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
    return NextResponse.redirect(url, 308);
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

