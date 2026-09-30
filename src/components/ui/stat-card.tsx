import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function DashboardCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "neutral",
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  icon?: LucideIcon;
  hint?: ReactNode;
  tone?: "neutral" | "accent" | "positive" | "warning";
  className?: string;
}) {
  const toneCls = {
    neutral: "text-muted bg-white/5",
    accent: "text-accent bg-accent-soft",
    positive: "text-positive bg-positive-soft",
    warning: "text-warning bg-warning-soft",
  }[tone];
  return (
    <div className={cn("rounded-2xl border border-line bg-surface p-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{label}</p>
        {Icon && (
          <span className={cn("grid size-9 place-items-center rounded-xl", toneCls)}>
            <Icon className="size-4.5" aria-hidden />
          </span>
        )}
      </div>
      <p className="tabular mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-subtle">{hint}</p>}
    </div>
  );
}
