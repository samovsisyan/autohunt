"use client";

import { useEffect, useState } from "react";
import { Gavel, Search } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { RequestForm, type RequestFormLabels } from "./request-form";
import { cn } from "@/lib/cn";

/** Import request with a toggle for "I don't have a car yet" (car-search request). */
export function ImportForms({
  locale,
  formT,
  t,
  submitImport,
  submitSearch,
}: {
  locale: Locale;
  formT: RequestFormLabels;
  t: Dictionary["import"];
  submitImport: string;
  submitSearch: string;
}) {
  const [mode, setMode] = useState<"lot" | "search">("lot");
  useEffect(() => {
    const sync = () => window.location.hash === "#search" && setMode("search");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <div id="search" className="scroll-mt-24 rounded-3xl border border-line bg-surface p-6 sm:p-10">
      <div className="mb-8 grid grid-cols-2 gap-1 rounded-2xl bg-white/[0.03] p-1" role="tablist">
        {[
          { id: "lot" as const, label: t.haveCar, icon: Gavel },
          { id: "search" as const, label: t.noCar, icon: Search },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={mode === id}
            onClick={() => setMode(id)}
            className={cn("inline-flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors", mode === id ? "bg-white/10 text-fg" : "text-subtle hover:text-fg")}
          >
            <Icon className="size-4" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>
      <h2 className="font-display text-2xl font-semibold sm:text-3xl">{mode === "lot" ? t.formTitle : t.noCarTitle}</h2>
      <p className="mt-2 text-muted">{mode === "lot" ? t.formSubtitle : t.noCarText}</p>
      <div className="mt-8">
        {mode === "lot" ? (
          <RequestForm key="lot" type="IMPORT" locale={locale} t={{ ...formT, submit: submitImport }} />
        ) : (
          <RequestForm key="search" type="CAR_SEARCH" locale={locale} t={{ ...formT, submit: submitSearch }} />
        )}
      </div>
    </div>
  );
}
