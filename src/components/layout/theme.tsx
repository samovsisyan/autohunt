"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { STORAGE_KEY, themeColors, type Theme } from "./theme-script";

const listeners = new Set<() => void>();
const readTheme = (): Theme => (document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
const serverTheme = (): Theme => "dark";
const subscribe = (l: () => void) => {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && (e.newValue === "light" || e.newValue === "dark")) applyTheme(e.newValue, false);
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
};

function applyTheme(theme: Theme, persist = true) {
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", themeColors[theme]));
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }
  listeners.forEach((l) => l());
}

export function useTheme(): [Theme, (t: Theme) => void] {
  return [useSyncExternalStore(subscribe, readTheme, serverTheme), applyTheme];
}

export function ThemeToggle({ labels, className }: { labels: { light: string; dark: string }; className?: string }) {
  const [theme, setTheme] = useTheme();
  const next: Theme = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className={cn("grid size-10 place-items-center rounded-xl text-muted transition-colors hover:bg-fg/5 hover:text-fg", className)}
      aria-label={labels[next]}
      title={labels[next]}
    >
      {/* Icons switch in CSS so they're right before hydration. */}
      <Sun className="size-[1.15rem] light:hidden" />
      <Moon className="hidden size-[1.15rem] light:block" />
    </button>
  );
}
