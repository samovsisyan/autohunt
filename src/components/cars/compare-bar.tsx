"use client";

import Link from "next/link";
import { GitCompareArrows, X } from "lucide-react";
import { compareStore } from "@/lib/saved-store";
import { buttonClasses } from "@/components/ui/button";

export function CompareBar({ compareHref, labels }: { compareHref: string; labels: { bar: string; open: string; clear: string } }) {
  const list = compareStore.use();
  if (list.length === 0) return null;
  return (
    <div className="fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex justify-center px-4">
      <div className="glass flex animate-fade-up items-center gap-3 rounded-2xl py-2 pr-2 pl-4 shadow-2xl">
        <GitCompareArrows className="size-4 text-accent" />
        <span className="text-sm">{labels.bar.replace("{count}", String(list.length))}</span>
        <button onClick={() => compareStore.clear()} className="rounded-lg p-1.5 text-subtle hover:bg-fg/5 hover:text-fg" aria-label={labels.clear}>
          <X className="size-4" />
        </button>
        <Link href={compareHref} className={buttonClasses("accent", "sm")}>
          {labels.open}
        </Link>
      </div>
    </div>
  );
}
