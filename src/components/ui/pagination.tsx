import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function Pagination({ page, pages, hrefFor }: { page: number; pages: number; hrefFor: (p: number) => string }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1);
  const cls = "grid size-10 place-items-center rounded-xl border border-line text-sm transition-colors hover:border-line-strong hover:text-fg";
  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className={cls} aria-label="Previous" rel="prev">
          <ChevronLeft className="size-4" />
        </Link>
      )}
      {nums.map((p, i) => (
        <span key={p} className="contents">
          {i > 0 && nums[i - 1] !== p - 1 && <span className="px-1 text-subtle">…</span>}
          <Link href={hrefFor(p)} aria-current={p === page ? "page" : undefined} className={cn(cls, p === page ? "border-accent/50 bg-accent-soft text-fg" : "text-muted")}>
            {p}
          </Link>
        </span>
      ))}
      {page < pages && (
        <Link href={hrefFor(page + 1)} className={cls} aria-label="Next" rel="next">
          <ChevronRight className="size-4" />
        </Link>
      )}
    </nav>
  );
}
