"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Car,
  Ship,
  Inbox,
  Users,
  Calculator,
  Newspaper,
  LayoutTemplate,
  Search,
  Languages,
  Menu,
  X,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme";
import { cn } from "@/lib/cn";
import { useAdminT } from "./i18n";
import { AdminLocaleSwitcher } from "./locale-switcher";

const groups = [
  {
    title: "overview",
    items: [{ href: "/admin", label: "dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    title: "business",
    items: [
      { href: "/admin/cars", label: "cars", icon: Car },
      { href: "/admin/imports", label: "imports", icon: Ship },
      { href: "/admin/requests", label: "requests", icon: Inbox, badgeKey: "requests" as const },
      { href: "/admin/customers", label: "customers", icon: Users },
    ],
  },
  {
    title: "configuration",
    items: [{ href: "/admin/calculator", label: "calculator", icon: Calculator }],
  },
  {
    title: "content",
    items: [
      { href: "/admin/blog", label: "blog", icon: Newspaper },
      { href: "/admin/pages", label: "pages", icon: LayoutTemplate },
      { href: "/admin/seo", label: "seo", icon: Search },
      { href: "/admin/languages", label: "languages", icon: Languages },
    ],
  },
] as const;

export function AdminNav({ user, badges }: { user: { name: string; email: string }; badges: { requests: number } }) {
  const pathname = usePathname();
  const { t } = useAdminT();
  const [open, setOpen] = useState(false);
  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(href + "/"));

  const nav = (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
      {groups.map((g) => (
        <div key={g.title}>
          <p className="mb-2 px-3 text-[11px] font-medium tracking-[0.14em] text-subtle uppercase">{t.nav[g.title]}</p>
          <ul className="space-y-0.5">
            {g.items.map((item) => {
              const active = isActive(item.href, "exact" in item && item.exact);
              const badge = "badgeKey" in item && item.badgeKey ? badges[item.badgeKey] : 0;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn("flex h-9 items-center gap-3 rounded-lg px-3 text-sm transition-colors", active ? "bg-fg/[0.07] text-fg" : "text-muted hover:bg-fg/[0.03] hover:text-fg")}
                  >
                    <item.icon className={cn("size-4", active && "text-accent")} />
                    {t.nav[item.label]}
                    {badge > 0 && <span className="ml-auto rounded-full bg-accent px-1.5 text-[11px] font-semibold text-bg">{badge}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const footer = (
    <div className="border-t border-line p-3">
      <Link href="/hy" target="_blank" className="flex h-9 items-center gap-3 rounded-lg px-3 text-sm text-muted hover:bg-fg/[0.03] hover:text-fg">
        <ExternalLink className="size-4" /> {t.nav.viewWebsite}
      </Link>
      <button
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          window.location.href = "/admin/login";
        }}
        className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted hover:bg-fg/[0.03] hover:text-fg"
      >
        <LogOut className="size-4" /> {t.nav.signOut}
      </button>
      <div className="mt-2 flex items-center justify-between gap-2 px-1">
        <AdminLocaleSwitcher />
        <ThemeToggle labels={{ light: t.common.lightTheme, dark: t.common.darkTheme }} className="size-9 shrink-0" />
      </div>
      <div className="mt-2 px-3 py-2">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="truncate text-xs text-subtle">{user.email}</p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-surface lg:flex">
        <div className="flex h-16 items-center border-b border-line px-6">
          <Link href="/admin">
            <Logo />
          </Link>
        </div>
        {nav}
        {footer}
      </aside>
      <header className="glass sticky top-0 z-40 flex h-14 items-center justify-between border-x-0 border-t-0 px-4 lg:hidden">
        <Link href="/admin">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle labels={{ light: t.common.lightTheme, dark: t.common.darkTheme }} />
          <button onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-lg hover:bg-fg/5" aria-label={t.nav.openMenu}>
            <Menu className="size-5" />
          </button>
        </div>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 animate-fade-in flex-col border-r border-line bg-surface">
            <div className="flex h-14 items-center justify-between border-b border-line px-4">
              <Logo />
              <button onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-lg hover:bg-fg/5" aria-label={t.nav.closeMenu}>
                <X className="size-5" />
              </button>
            </div>
            {nav}
            {footer}
          </aside>
        </div>
      )}
    </>
  );
}
