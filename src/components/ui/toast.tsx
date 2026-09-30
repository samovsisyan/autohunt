"use client";

import { useSyncExternalStore } from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastKind = "success" | "error" | "info";
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

let items: ToastItem[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
let nextId = 1;

export function toast(message: string, kind: ToastKind = "success") {
  const id = nextId++;
  items = [...items, { id, kind, message }].slice(-3);
  emit();
  setTimeout(() => {
    items = items.filter((t) => t.id !== id);
    emit();
  }, 3800);
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const EMPTY: ToastItem[] = [];

export function Toaster() {
  const list = useSyncExternalStore(subscribe, () => items, () => EMPTY);
  const Icon = { success: CheckCircle2, error: AlertCircle, info: Info };
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[90] flex flex-col items-center gap-2 px-4 sm:right-6 sm:left-auto sm:items-end"
    >
      {list.map((t) => {
        const I = Icon[t.kind];
        return (
          <div
            key={t.id}
            role="status"
            className="glass pointer-events-auto flex animate-fade-up items-center gap-3 rounded-2xl px-4 py-3 text-sm shadow-2xl"
          >
            <I
              className={cn(
                "size-5 shrink-0",
                t.kind === "success" ? "text-positive" : t.kind === "error" ? "text-danger" : "text-accent",
              )}
            />
            {t.message}
          </div>
        );
      })}
    </div>
  );
}
