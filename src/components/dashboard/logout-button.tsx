"use client";

import { LogOut } from "lucide-react";
import { cn } from "@/lib/cn";

export function LogoutButton({ label, locale, className }: { label: string; locale: string; className?: string }) {
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        window.location.href = `/${locale}`;
      }}
      className={cn("inline-flex h-10 w-full items-center gap-3 rounded-xl px-3.5 text-sm text-muted hover:bg-fg/[0.03] hover:text-fg", className)}
    >
      <LogOut className="size-4" />
      {label}
    </button>
  );
}
