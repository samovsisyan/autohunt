import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { JsonLd, breadcrumbLd } from "@/components/seo/json-ld";
import { Eyebrow } from "@/components/ui/section";
import { absoluteUrl } from "@/lib/site";
import { cn } from "@/lib/cn";

export interface Crumb {
  name: string;
  href: string;
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className={cn("text-xs text-subtle", className)}>
        <ol className="flex flex-wrap items-center gap-1.5">
          {items.map((c, i) => (
            <li key={c.href} className="inline-flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="size-3" aria-hidden />}
              {i === items.length - 1 ? (
                <span aria-current="page" className="text-muted">
                  {c.name}
                </span>
              ) : (
                <Link href={c.href} className="hover:text-fg">
                  {c.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbLd(items.map((c) => ({ name: c.name, url: absoluteUrl(c.href) })))} />
    </>
  );
}

export function PageHeader({
  crumbs,
  eyebrow,
  title,
  subtitle,
  children,
  className,
}: {
  crumbs: Crumb[];
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden border-b border-line pt-28 pb-12 sm:pt-32 sm:pb-16", className)}>
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[900px] -translate-x-1/2 rounded-full bg-accent/[0.07] blur-3xl" aria-hidden />
      <div className="container-page relative">
        <Breadcrumbs items={crumbs} className="mb-8" />
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="max-w-4xl font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">{title}</h1>
        {subtitle && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
