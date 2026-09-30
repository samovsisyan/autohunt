import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("mb-4 inline-flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-accent uppercase", className)}>
      <span className="h-px w-6 bg-accent/60" aria-hidden />
      {children}
    </p>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
  align = "left",
  as: As = "h2",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-6 md:mb-14",
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <As className="font-display text-3xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]">
          {title}
        </As>
        {subtitle && <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-3xl border border-line bg-surface shadow-card", className)}>{children}</div>
  );
}
