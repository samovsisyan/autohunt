import Link from "next/link";
import { Car } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { requireUser } from "@/server/auth/session";
import { getUserImports } from "@/server/services/dashboard.service";
import { ImportCard } from "@/components/dashboard/import-card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";

export default async function MyCarsPage({ params }: PageProps<"/[locale]/dashboard/cars">) {
  const locale = (await params).locale as Locale;
  const user = await requireUser(href(locale, "/login"));
  const [t, imports] = await Promise.all([getDictionary(locale), getUserImports(user.id)]);
  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-semibold tracking-tight">{t.dashboard.nav.cars}</h1>
      {imports.length ? (
        <div className="space-y-4">
          {imports.map((imp) => (
            <ImportCard key={imp.id} imp={imp} locale={locale} t={t} base={href(locale, "/dashboard")} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Car} title={t.dashboard.empty.cars} action={<Link href={href(locale, "/cars")} className={buttonClasses("primary")}>{t.nav.cta}</Link>} />
      )}
    </div>
  );
}
