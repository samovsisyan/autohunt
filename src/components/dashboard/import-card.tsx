import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatUsd } from "@/i18n/format";
import type { UserImport } from "@/server/services/dashboard.service";
import { StatusBadge } from "@/components/ui/badge";
import { ImportTimeline } from "./import-timeline";

export function FinanceSummary({ imp, locale, t }: { imp: Pick<UserImport, "purchasePrice" | "estimatedTotal" | "finalTotal" | "paidAmount">; locale: Locale; t: Dictionary }) {
  const total = imp.finalTotal ?? imp.estimatedTotal;
  const remaining = Math.max(0, total - imp.paidAmount);
  const paidPct = Math.min(100, (imp.paidAmount / Math.max(total, 1)) * 100);
  const usd = (n: number) => formatUsd(n, locale);
  return (
    <div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs text-subtle">{t.dashboard.finance.purchase}</dt>
          <dd className="tabular mt-0.5 font-medium">{usd(imp.purchasePrice)}</dd>
        </div>
        <div>
          <dt className="text-xs text-subtle">{imp.finalTotal ? t.dashboard.finance.finalTotal : t.dashboard.finance.estimatedTotal}</dt>
          <dd className="tabular mt-0.5 font-medium">
            {usd(total)}
            {!imp.finalTotal && <span className="ml-1.5 rounded bg-fg/5 px-1 py-0.5 align-middle text-[10px] font-normal text-subtle">{t.common.estimated}</span>}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-subtle">{t.dashboard.finance.paid}</dt>
          <dd className="tabular mt-0.5 font-medium text-positive">{usd(imp.paidAmount)}</dd>
        </div>
        <div>
          <dt className="text-xs text-subtle">{t.dashboard.finance.remaining}</dt>
          <dd className="tabular mt-0.5 font-medium text-warning">{usd(remaining)}</dd>
        </div>
      </dl>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-fg/5" role="progressbar" aria-valuenow={Math.round(paidPct)} aria-valuemin={0} aria-valuemax={100} aria-label={t.dashboard.finance.paid}>
        <div className="h-full rounded-full bg-positive" style={{ width: `${paidPct}%` }} />
      </div>
    </div>
  );
}

export function ImportCard({ imp, locale, t, base }: { imp: UserImport; locale: Locale; t: Dictionary; base: string }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-line bg-surface transition-colors hover:border-line-strong">
      <div className="grid sm:grid-cols-[220px_1fr]">
        <div className="relative aspect-[16/10] sm:aspect-auto">
          {imp.imageUrl && <Image src={imp.imageUrl} alt="" fill sizes="(min-width: 640px) 220px, 100vw" className="object-cover" />}
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-subtle tabular">{imp.code}</p>
              <h3 className="mt-1 font-display text-lg font-semibold">
                <Link href={`${base}/imports/${imp.id}`} className="after:absolute after:inset-0">
                  {imp.vehicleTitle} {imp.vehicleYear}
                </Link>
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={imp.currentStage === "READY" ? "READY" : "CURRENT"} label={t.enums.stage[imp.currentStage]} />
              <ArrowUpRight className="size-4 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
          <div className="mt-5">
            <ImportTimeline events={imp.events} locale={locale} t={t} orientation="horizontal" />
          </div>
          <div className="mt-5 border-t border-line pt-5">
            <FinanceSummary imp={imp} locale={locale} t={t} />
          </div>
        </div>
      </div>
    </article>
  );
}
