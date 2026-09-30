import Link from "next/link";
import { Calculator as CalcIcon, Trash2 } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formatDate, formatUsd } from "@/i18n/format";
import { requireUser } from "@/server/auth/session";
import { getUserCalculations } from "@/server/services/dashboard.service";
import { deleteCalculationAction } from "@/server/actions/dashboard";
import type { EstimateInput, EstimateResult } from "@/server/calculator/engine";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";

export default async function CalculationsPage({ params }: PageProps<"/[locale]/dashboard/calculations">) {
  const locale = (await params).locale as Locale;
  const user = await requireUser(href(locale, "/login"));
  const [t, calcs] = await Promise.all([getDictionary(locale), getUserCalculations(user.id)]);
  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold tracking-tight">{t.dashboard.nav.calculations}</h1>
        <Link href={href(locale, "/calculator")} className={buttonClasses("primary", "sm")}>
          <CalcIcon className="size-4" /> {t.nav.calculator}
        </Link>
      </div>
      {calcs.length ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {calcs.map((c) => {
            const input = c.input as unknown as EstimateInput;
            const result = c.result as unknown as EstimateResult;
            const q = new URLSearchParams(Object.entries(input).map(([k, v]) => [k, String(v)]));
            return (
              <li key={c.id} className="rounded-3xl border border-line bg-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{c.label ?? `${input.year} · ${t.enums.fuel[input.fuel]}`}</p>
                    <p className="mt-1 text-xs text-subtle">
                      {input.auction} · {input.year} · {input.engine ? `${input.engine}L` : "EV"} · {formatDate(c.createdAt, locale)}
                    </p>
                  </div>
                  <form action={deleteCalculationAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className="rounded-lg p-2 text-subtle hover:bg-white/5 hover:text-danger" aria-label={t.common.remove}>
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </div>
                <div className="mt-5 flex items-end justify-between border-t border-line pt-4">
                  <div>
                    <p className="text-xs text-subtle">{t.calculator.lines.carPrice}</p>
                    <p className="tabular font-medium">{formatUsd(input.price, locale)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-subtle">{t.calculator.total}</p>
                    <p className="tabular font-display text-2xl font-semibold text-positive">{formatUsd(result.total, locale)}</p>
                  </div>
                </div>
                <Link href={`${href(locale, "/calculator")}?${q}`} className={buttonClasses("outline", "sm", "mt-4 w-full")}>
                  {t.dashboard.openCalculation}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState icon={CalcIcon} title={t.dashboard.empty.calculations} action={<Link href={href(locale, "/calculator")} className={buttonClasses("primary")}>{t.nav.calculator}</Link>} />
      )}
    </div>
  );
}
