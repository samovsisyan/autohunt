"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { localeLabels, locales, type Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";

function Switcher({ current, className, full }: { current: Locale; className?: string; full?: boolean }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const swap = (l: Locale) => {
    const parts = pathname.split("/");
    parts[1] = l;
    return parts.join("/") + (search ? `?${search}` : "");
  };
  return (
    <div className={cn("inline-flex items-center rounded-full border border-line bg-white/[0.03] p-0.5", className)} role="group" aria-label="Language">
      {locales.map((l) => (
        <Link
          key={l}
          href={swap(l)}
          hrefLang={l}
          lang={l}
          aria-current={l === current ? "true" : undefined}
          scroll={false}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
            full && "flex-1 px-4 py-2 text-center text-sm",
            l === current ? "bg-white/10 text-fg" : "text-subtle hover:text-fg",
          )}
        >
          {full ? localeLabels[l].name : localeLabels[l].short}
        </Link>
      ))}
    </div>
  );
}

export function LanguageSwitcher(props: { current: Locale; className?: string; full?: boolean }) {
  return (
    <Suspense fallback={<div className={cn("h-8 w-[118px] rounded-full border border-line", props.className)} />}>
      <Switcher {...props} />
    </Suspense>
  );
}
