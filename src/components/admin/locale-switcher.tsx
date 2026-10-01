"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { localeLabels, locales } from "@/i18n/config";
import { setAdminLocaleAction } from "@/server/actions/admin-locale";
import { cn } from "@/lib/cn";
import { useAdminT } from "./i18n";

export function AdminLocaleSwitcher({ className }: { className?: string }) {
  const { t, locale } = useAdminT();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className={cn("inline-flex items-center rounded-full border border-line bg-fg/[0.03] p-0.5", pending && "opacity-60", className)} role="group" aria-label={t.common.language}>
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={l === locale}
          disabled={pending}
          onClick={() =>
            start(async () => {
              await setAdminLocaleAction(l);
              router.refresh();
            })
          }
          className={cn("rounded-full px-2.5 py-1 text-xs font-medium transition-colors", l === locale ? "bg-fg/10 text-fg" : "text-subtle hover:text-fg")}
        >
          {localeLabels[l].short}
        </button>
      ))}
    </div>
  );
}
