import Image from "next/image";
import Link from "next/link";
import { Ship, ArrowUpRight } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { requireUser } from "@/server/auth/session";
import { getUserImports } from "@/server/services/dashboard.service";
import { ImportTimeline } from "@/components/dashboard/import-timeline";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ImportsPage({ params }: PageProps<"/[locale]/dashboard/imports">) {
  const locale = (await params).locale as Locale;
  const user = await requireUser(href(locale, "/login"));
  const [t, imports] = await Promise.all([getDictionary(locale), getUserImports(user.id)]);
  const base = href(locale, "/dashboard");
  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-semibold tracking-tight">{t.dashboard.nav.imports}</h1>
      {imports.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {imports.map((imp) => {
            const current = imp.events.find((e) => e.status === "CURRENT") ?? imp.events.findLast((e) => e.status === "DONE");
            return (
              <Link key={imp.id} href={`${base}/imports/${imp.id}`} className="group rounded-3xl border border-line bg-surface p-5 transition-colors hover:border-line-strong">
                <div className="flex items-center gap-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl">
                    {imp.imageUrl && <Image src={imp.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-subtle tabular">{imp.code} · {imp.auction?.name}</p>
                    <p className="truncate font-display font-semibold">{imp.vehicleTitle} {imp.vehicleYear}</p>
                    {current?.location && <p className="truncate text-xs text-muted">{current.location}</p>}
                  </div>
                  <StatusBadge status={imp.currentStage === "READY" ? "READY" : "CURRENT"} label={t.enums.stage[imp.currentStage]} />
                  <ArrowUpRight className="size-4 shrink-0 text-subtle" />
                </div>
                <div className="mt-5">
                  <ImportTimeline events={imp.events} locale={locale} t={t} orientation="horizontal" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Ship} title={t.dashboard.empty.cars} />
      )}
    </div>
  );
}
