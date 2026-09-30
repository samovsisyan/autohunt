import Link from "next/link";
import { Ship, CheckCircle2, Wallet, Hourglass, ArrowRight, Calculator as CalcIcon } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { fmt, formatUsd } from "@/i18n/format";
import { requireUser } from "@/server/auth/session";
import { getOverview } from "@/server/services/dashboard.service";
import { DashboardCard } from "@/components/ui/stat-card";
import { ImportCard } from "@/components/dashboard/import-card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";

export default async function DashboardOverview({ params }: PageProps<"/[locale]/dashboard">) {
  const locale = (await params).locale as Locale;
  const user = await requireUser(href(locale, "/login"));
  const [t, data] = await Promise.all([getDictionary(locale), getOverview(user.id)]);
  const base = href(locale, "/dashboard");
  const active = data.imports.filter((i) => i.currentStage !== "READY");

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-subtle">{t.dashboard.title}</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{fmt(t.dashboard.hello, { name: user.name.split(" ")[0] })}</h1>
        </div>
        <Link href={href(locale, "/calculator")} className={buttonClasses("outline", "sm")}>
          <CalcIcon className="size-4" />
          {t.nav.calculator}
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <DashboardCard label={t.dashboard.stats.activeImports} value={data.stats.active} icon={Ship} tone="accent" />
        <DashboardCard label={t.dashboard.stats.delivered} value={data.stats.delivered} icon={CheckCircle2} tone="positive" />
        <DashboardCard label={t.dashboard.stats.totalPaid} value={formatUsd(data.stats.paid, locale)} icon={Wallet} />
        <DashboardCard label={t.dashboard.stats.remaining} value={formatUsd(data.stats.remaining, locale)} icon={Hourglass} tone="warning" />
      </div>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">{t.dashboard.nav.imports}</h2>
          <Link href={`${base}/imports`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
            {t.common.viewAll} <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {active.length ? (
          <div className="space-y-4">
            {active.map((imp) => (
              <ImportCard key={imp.id} imp={imp} locale={locale} t={t} base={base} />
            ))}
          </div>
        ) : (
          <EmptyState icon={Ship} title={t.dashboard.empty.cars} action={<Link href={href(locale, "/import")} className={buttonClasses("primary")}>{t.nav.import}</Link>} />
        )}
      </section>
    </div>
  );
}
