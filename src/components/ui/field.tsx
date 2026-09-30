import type { ComponentProps, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export const controlClasses =
  "w-full h-12 rounded-xl border border-line bg-white/[0.03] px-4 text-[0.9375rem] text-fg placeholder:text-subtle transition-colors outline-none hover:border-line-strong focus:border-accent/60 focus:bg-white/[0.05] focus:ring-4 focus:ring-accent/10 disabled:opacity-50 aria-[invalid=true]:border-danger/60";

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("mb-1.5 block text-[0.8125rem] font-medium text-muted", className)} {...props} />;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
}: {
  label?: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-subtle">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlClasses, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(controlClasses, "h-auto min-h-28 py-3 leading-relaxed", className)} {...props} />;
}

export function Select({
  className,
  options,
  placeholder,
  ...props
}: ComponentProps<"select"> & { options: { value: string; label: string }[]; placeholder?: string }) {
  return (
    <div className="relative">
      <select className={cn(controlClasses, "cursor-pointer appearance-none pr-10", className)} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-elevated">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-subtle" aria-hidden />
    </div>
  );
}

/** Pill-style segmented control / multi-choice chip */
export function Chip({
  active,
  className,
  ...props
}: ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-all",
        active
          ? "border-accent/50 bg-accent-soft text-fg"
          : "border-line text-muted hover:border-line-strong hover:text-fg",
        className,
      )}
      {...props}
    />
  );
}
