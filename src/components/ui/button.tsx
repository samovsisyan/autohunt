import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

const variants = {
  primary: "bg-fg text-bg hover:bg-fg/90 shadow-[0_8px_24px_-12px_color-mix(in_oklab,var(--color-fg)_50%,transparent)]",
  accent: "bg-accent text-[#04161c] hover:brightness-110 shadow-[0_10px_30px_-12px_color-mix(in_oklab,var(--color-accent)_70%,transparent)]",
  secondary: "glass text-fg hover:bg-fg/10",
  outline: "border border-line-strong text-fg hover:bg-fg/5 hover:border-fg/25",
  ghost: "text-muted hover:text-fg hover:bg-fg/5",
  danger: "bg-danger-soft text-danger border border-danger/30 hover:bg-danger/20",
} as const;

const sizes = {
  sm: "h-9 px-3.5 text-sm gap-1.5 rounded-lg",
  md: "h-11 px-5 text-[0.9375rem] gap-2 rounded-xl",
  lg: "h-13 px-7 text-base gap-2.5 rounded-2xl",
  icon: "size-10 rounded-xl",
} as const;

type Common = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  children?: ReactNode;
  className?: string;
};

type ButtonProps = Common & ComponentProps<"button"> & { href?: undefined };
type LinkProps = Common & Omit<ComponentProps<typeof Link>, "className"> & { href: string };

export function buttonClasses(variant: keyof typeof variants = "primary", size: keyof typeof sizes = "md", className?: string) {
  return cn(
    "inline-flex shrink-0 select-none items-center justify-center font-medium whitespace-nowrap transition-all duration-200 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button(props: ButtonProps | LinkProps) {
  const { variant, size, loading, className, children, ...rest } = props;
  const classes = buttonClasses(variant, size, className);
  if (typeof rest.href === "string") {
    return (
      <Link {...(rest as Omit<LinkProps, keyof Common>)} className={classes}>
        {children}
      </Link>
    );
  }
  const btn = rest as ComponentProps<"button">;
  return (
    <button type="button" {...btn} disabled={btn.disabled || loading} className={classes}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
