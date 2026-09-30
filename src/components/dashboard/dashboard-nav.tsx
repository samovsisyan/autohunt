"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Car, Ship, Calculator, FileText, Inbox, Bell, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { key: "overview", path: "", icon: LayoutDashboard },
  { key: "cars", path: "/cars", icon: Car },
  { key: "imports", path: "/imports", icon: Ship },
  { key: "calculations", path: "/calculations", icon: Calculator },
  { key: "documents", path: "/documents", icon: FileText },
  { key: "requests", path: "/requests", icon: Inbox },
  { key: "notifications", path: "/notifications", icon: Bell },
  { key: "profile", path: "/profile", icon: UserRound },
] as const;

export function DashboardNav({ base, labels, unread }: { base: string; labels: Record<(typeof items)[number]["key"], string>; unread: number }) {
  const pathname = usePathname();
  const active = (path: string) => (path === "" ? pathname === base : pathname.startsWith(base + path));
  return (
    <nav aria-label="Dashboard" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
      {items.map(({ key, path, icon: Icon }) => (
        <Link
          key={key}
          href={base + path}
          aria-current={active(path) ? "page" : undefined}
          className={cn(
            "inline-flex h-10 shrink-0 items-center gap-3 rounded-xl px-3.5 text-sm transition-colors",
            active(path) ? "bg-white/[0.07] text-fg" : "text-muted hover:bg-white/[0.03] hover:text-fg",
          )}
        >
          <Icon className={cn("size-4", active(path) && "text-accent")} />
          {labels[key]}
          {key === "notifications" && unread > 0 && <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-bg">{unread}</span>}
        </Link>
      ))}
    </nav>
  );
}
