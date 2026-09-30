import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
  className,
}: {
  icon: LucideIcon;
  title: ReactNode;
  text?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center rounded-3xl border border-dashed border-line-strong px-6 py-16 text-center", className)}>
      <div className="mb-5 grid size-14 place-items-center rounded-2xl border border-line bg-elevated text-muted">
        <Icon className="size-6" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {text && <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-xl bg-[linear-gradient(90deg,rgb(255_255_255/0.03)_0%,rgb(255_255_255/0.07)_50%,rgb(255_255_255/0.03)_100%)] bg-[length:800px_100%]",
        className,
      )}
    />
  );
}

export function LoadingState({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)} aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
