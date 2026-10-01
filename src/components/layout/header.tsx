"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Heart, Menu, User, X, ArrowRight } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import { favoritesStore } from "@/lib/saved-store";
import { cn } from "@/lib/cn";
import { buttonClasses } from "@/components/ui/button";
import { Logo } from "./logo";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme";

export interface HeaderLabels {
  cars: string;
  rent: string;
  import: string;
  calculator: string;
  corporate: string;
  app: string;
  about: string;
  blog: string;
  login: string;
  dashboard: string;
  cta: string;
  menu: string;
  close: string;
  language: string;
  saved: string;
  lightTheme: string;
  darkTheme: string;
}

const subscribeCookie = (cb: () => void) => {
  // Re-check right after hydration (the server snapshot is always "signed out").
  const t = setTimeout(cb, 0);
  window.addEventListener("focus", cb);
  document.addEventListener("visibilitychange", cb);
  return () => {
    clearTimeout(t);
    window.removeEventListener("focus", cb);
    document.removeEventListener("visibilitychange", cb);
  };
};
const readHint = () => document.cookie.match(/(?:^|; )ah_user=([^;]*)/)?.[1] ?? "";
const noHint = () => "";

/** Reads the non-sensitive `ah_user` hint cookie so the header can stay static. */
function useUserHint(): { n: string; r: string } | null {
  const raw = useSyncExternalStore(subscribeCookie, readHint, noHint);
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

export function Header({ locale, t }: { locale: Locale; t: HeaderLabels }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const favorites = favoritesStore.use();
  const user = useUserHint();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu when the route changes (adjusting state during render, per React docs).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const nav = [
    { href: "/cars", label: t.cars },
    { href: "/rent", label: t.rent },
    { href: "/import", label: t.import },
    { href: "/calculator", label: t.calculator },
    { href: "/corporate", label: t.corporate },
    { href: "/app", label: t.app },
    { href: "/about", label: t.about },
    { href: "/blog", label: t.blog },
  ];
  const isActive = (p: string) => pathname === href(locale, p) || pathname.startsWith(href(locale, p) + "/");
  const accountHref = user ? (user.r === "ADMIN" ? "/admin" : href(locale, "/dashboard")) : href(locale, "/login");

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled || open ? "border-b border-line bg-bg/90 shadow-[0_8px_24px_-16px_rgb(0_0_0/0.25)] backdrop-blur-xl backdrop-saturate-150" : "border-b border-transparent bg-gradient-to-b from-bg/60 to-transparent",
        )}
      >
        <div className="container-page flex h-16 items-center gap-6 lg:h-18">
          <Link href={href(locale)} className="shrink-0" aria-label="AutoHunt">
            <Logo />
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-0.5 xl:flex" aria-label="Main">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={href(locale, item.href)}
                className={cn(
                  "rounded-lg px-2.5 py-2 text-sm whitespace-nowrap transition-colors 2xl:px-3",
                  isActive(item.href) ? "text-fg" : "text-muted hover:text-fg",
                )}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 xl:ml-0">
            <LanguageSwitcher current={locale} className="hidden md:inline-flex" />
            <ThemeToggle labels={{ light: t.lightTheme, dark: t.darkTheme }} />
            <Link
              href={href(locale, "/favorites")}
              className="relative hidden size-10 place-items-center rounded-xl text-muted transition-colors hover:bg-fg/5 hover:text-fg sm:grid"
              aria-label={t.saved}
            >
              <Heart className="size-[1.15rem]" />
              {favorites.length > 0 && (
                <span className="absolute top-1.5 right-1.5 grid size-4 place-items-center rounded-full bg-accent text-[10px] font-semibold text-bg">
                  {favorites.length}
                </span>
              )}
            </Link>
            <Link
              href={accountHref}
              className="hidden h-10 items-center gap-2 rounded-xl px-3 text-sm whitespace-nowrap text-muted transition-colors hover:bg-fg/5 hover:text-fg sm:inline-flex"
            >
              <User className="size-4" />
              {user ? user.n || t.dashboard : t.login}
            </Link>
            <Link href={href(locale, "/cars")} className={buttonClasses("primary", "sm", "hidden md:inline-flex")}>
              {t.cta}
            </Link>
            <button
              className="grid size-10 place-items-center rounded-xl text-fg hover:bg-fg/5 xl:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t.close : t.menu}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile / tablet menu */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 z-40 bg-bg/95 backdrop-blur-xl transition-opacity duration-300 xl:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        inert={!open}
      >
        <div className="container-page flex h-full flex-col pt-24 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <nav className="flex-1 overflow-y-auto" aria-label="Mobile">
            {nav.map((item, i) => (
              <Link
                key={item.href}
                href={href(locale, item.href)}
               
                className={cn(
                  "flex items-center justify-between border-b border-line py-4 font-display text-2xl font-medium transition-all duration-500",
                  open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                  isActive(item.href) ? "text-fg" : "text-muted",
                )}
                style={{ transitionDelay: open ? `${60 + i * 35}ms` : "0ms" }}
              >
                {item.label}
                <ArrowRight className="size-5 text-subtle" />
              </Link>
            ))}
          </nav>
          <div className="space-y-4 pt-6">
            <p className="text-xs tracking-widest text-subtle uppercase">{t.language}</p>
            <LanguageSwitcher current={locale} full className="flex w-full" />
            <div className="grid grid-cols-2 gap-3">
              <Link href={accountHref} className={buttonClasses("outline", "lg", "w-full")}>
                <User className="size-4" />
                {user ? user.n || t.dashboard : t.login}
              </Link>
              <Link href={href(locale, "/favorites")} className={buttonClasses("outline", "lg", "w-full")}>
                <Heart className="size-4" />
                {t.saved}
                {favorites.length > 0 && <span className="text-accent">{favorites.length}</span>}
              </Link>
            </div>
            <Link href={href(locale, "/cars")} className={buttonClasses("primary", "lg", "w-full")}>
              {t.cta}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
