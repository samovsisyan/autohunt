import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  neutral: "bg-fg/6 text-muted border-line",
  accent: "bg-accent-soft text-accent border-accent/25",
  positive: "bg-positive-soft text-positive border-positive/25",
  warning: "bg-warning-soft text-warning border-warning/25",
  danger: "bg-danger-soft text-danger border-danger/25",
  solid: "bg-black/55 text-white border-white/10 backdrop-blur-md",
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({
  tone = "neutral",
  dot,
  className,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

const statusTone: Record<string, BadgeTone> = {
  AVAILABLE: "positive",
  RESERVED: "warning",
  IN_TRANSIT: "accent",
  SOLD: "neutral",
  NEW: "accent",
  IN_PROGRESS: "warning",
  QUOTED: "positive",
  CLOSED: "neutral",
  READY: "positive",
  DONE: "positive",
  CURRENT: "accent",
  PENDING: "neutral",
};

export function StatusBadge({ status, label, className }: { status: string; label: string; className?: string }) {
  return (
    <Badge tone={statusTone[status] ?? "accent"} dot className={className}>
      {label}
    </Badge>
  );
}
