"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Search, ArrowRight, Gavel, MapPin } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { Select } from "@/components/ui/field";
import { Button, buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export interface QuickSearchLabels {
  title: string;
  inStock: string;
  fromAuction: string;
  brand: string;
  anyBrand: string;
  body: string;
  anyBody: string;
  budget: string;
  anyBudget: string;
  search: string;
  auctionHint: string;
  auctionCta: string;
}

export function QuickSearch({
  locale,
  t,
  brands,
  bodies,
}: {
  locale: Locale;
  t: QuickSearchLabels;
  brands: { value: string; label: string }[];
  bodies: { value: string; label: string }[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"stock" | "auction">("stock");
  const budgets = [10000, 15000, 20000, 30000, 50000, 80000].map((v) => ({ value: String(v), label: `$${v.toLocaleString("en-US")}` }));

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = new URLSearchParams();
    for (const key of ["brand", "body", "priceMax"]) {
      const v = String(fd.get(key) ?? "");
      if (v) q.set(key, v);
    }
    router.push(`/${locale}/cars${q.size ? `?${q}` : ""}`);
  }

  return (
    <section className="relative z-10 -mt-6 sm:-mt-10" aria-label={t.title}>
      <div className="container-page">
        <div className="rounded-3xl border border-line-strong bg-surface/95 p-2 shadow-2xl backdrop-blur-xl">
          <div className="flex gap-1 p-1" role="tablist">
            {[
              { id: "stock" as const, label: t.inStock, icon: MapPin },
              { id: "auction" as const, label: t.fromAuction, icon: Gavel },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={cn(
                  "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors sm:flex-none sm:px-5",
                  tab === id ? "bg-white/8 text-fg" : "text-subtle hover:text-fg",
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>

          {tab === "stock" ? (
            <form onSubmit={submit} className="grid gap-2 p-2 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
              <Select name="brand" aria-label={t.brand} placeholder={t.anyBrand} options={brands} />
              <Select name="body" aria-label={t.body} placeholder={t.anyBody} options={bodies} />
              <Select name="priceMax" aria-label={t.budget} placeholder={t.anyBudget} options={budgets.map((b) => ({ ...b, label: `${t.budget} ${b.label}` }))} />
              <Button type="submit" variant="accent" size="lg" className="h-12 sm:col-span-2 lg:col-span-1">
                <Search className="size-4" />
                {t.search}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col gap-4 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
              <p className="max-w-2xl text-sm leading-relaxed text-muted">{t.auctionHint}</p>
              <Link href={`/${locale}/import#request`} className={buttonClasses("accent", "lg", "h-12")}>
                {t.auctionCta}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
