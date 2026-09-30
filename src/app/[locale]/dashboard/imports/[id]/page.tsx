import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formatDate, formatUsd } from "@/i18n/format";
import { requireUser } from "@/server/auth/session";
import { getUserImport } from "@/server/services/dashboard.service";
import type { EstimateResult } from "@/server/calculator/engine";
import { ImportTimeline } from "@/components/dashboard/import-timeline";
import { FinanceSummary } from "@/components/dashboard/import-card";
import { CostBreakdown } from "@/components/calculator/cost-breakdown";
import { StatusBadge } from "@/components/ui/badge";

export default async function ImportDetailPage({ params }: PageProps<"/[locale]/dashboard/imports/[id]">) {
  const { locale: l, id } = await params;
  const locale = l as Locale;
  const user = await requireUser(href(locale, "/login"));
  const [t, imp] = await Promise.all([getDictionary(locale), getUserImport(user.id, id)]);
  if (!imp) notFound();
  const breakdown = imp.breakdown as EstimateResult | null;

  return (
    <div className="space-y-8">
      <Link href={href(locale, "/dashboard/imports")} className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" /> {t.dashboard.nav.imports}
      </Link>

      <header className="overflow-hidden rounded-3xl border border-line bg-surface">
        <div className="grid md:grid-cols-[1fr_1.2fr]">
          <div className="relative aspect-[16/10] md:aspect-auto">
            {imp.imageUrl && <Image src={imp.imageUrl} alt="" fill priority sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />}
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={imp.currentStage === "READY" ? "READY" : "CURRENT"} label={t.enums.stage[imp.currentStage]} />
              <span className="text-xs text-subtle tabular">{imp.code}</span>
            </div>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
              {imp.vehicleTitle} {imp.vehicleYear}
            </h1>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-subtle">{t.dashboard.auction}</dt>
                <dd className="mt-0.5 font-medium">{imp.auction?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-subtle">{t.dashboard.lot}</dt>
                <dd className="mt-0.5 font-medium tabular">{imp.lotNumber ?? "—"}</dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <dt className="text-xs text-subtle">{t.dashboard.vin}</dt>
                <dd className="mt-0.5 font-medium break-all tabular">{imp.vin ?? "—"}</dd>
              </div>
            </dl>
            <div className="mt-6 border-t border-line pt-6">
              <FinanceSummary imp={imp} locale={locale} t={t} />
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_1fr]">
        <section className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
          <h2 className="mb-8 font-display text-xl font-semibold">{t.dashboard.tracking}</h2>
          <ImportTimeline events={imp.events} locale={locale} t={t} />
        </section>
        <div className="space-y-8">
          {breakdown?.lines && (
            <section className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-3">
                <h2 className="font-display text-xl font-semibold">{t.calculator.breakdownTitle}</h2>
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-subtle">{imp.finalTotal ? t.common.final : t.common.estimated}</span>
              </div>
              <CostBreakdown lines={breakdown.lines} total={breakdown.total} t={t.calculator} format={(n) => formatUsd(n, locale)} />
              {imp.finalTotal && (
                <p className="mt-4 flex items-center justify-between rounded-2xl bg-positive-soft px-4 py-3 text-sm">
                  <span>{t.dashboard.finance.finalTotal}</span>
                  <span className="tabular font-semibold text-positive">{formatUsd(imp.finalTotal, locale)}</span>
                </p>
              )}
              <p className="mt-4 text-xs leading-relaxed text-subtle">{t.calculator.disclaimer}</p>
            </section>
          )}
          <section className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
            <h2 className="mb-5 font-display text-xl font-semibold">{t.dashboard.nav.documents}</h2>
            {imp.documents.length ? (
              <ul className="divide-y divide-line">
                {imp.documents.map((d) => (
                  <li key={d.id}>
                    <a href={d.url} target="_blank" rel="noopener" className="flex items-center justify-between gap-3 py-3 text-sm hover:text-accent">
                      <span className="inline-flex min-w-0 items-center gap-3">
                        <FileText className="size-4 shrink-0 text-subtle" />
                        <span className="truncate">{d.title}</span>
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-3 text-xs text-subtle">
                        {formatDate(d.createdAt, locale)}
                        <Download className="size-4" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">{t.dashboard.empty.documents}</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
