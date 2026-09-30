import type { Metadata } from "next";
import { Wrench, History, FileText, BellRing, ShieldCheck, Gauge, Car, CalendarClock } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { buildMetadata } from "@/server/seo";
import { Breadcrumbs } from "@/components/layout/page-header";
import { AppSection, CtaBand } from "@/components/home/sections";

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[locale]/app">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getDictionary(locale);
  return buildMetadata({ locale, path: "/app", title: t.meta.app.title, description: t.meta.app.description });
}

const icons = [Car, Wrench, History, FileText, CalendarClock, ShieldCheck, Gauge, BellRing];

export default async function AppPage({ params }: PageProps<"/[locale]/app">) {
  const locale = (await params).locale as Locale;
  const t = await getDictionary(locale);
  return (
    <>
      <div className="container-page pt-24 sm:pt-28">
        <Breadcrumbs
          items={[
            { name: t.nav.home, href: href(locale) },
            { name: t.nav.app, href: href(locale, "/app") },
          ]}
        />
      </div>
      <AppSection t={t} locale={locale} standalone />
      <section className="container-page pb-24">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.appSection.features.map((f, i) => {
            const Icon = icons[i];
            return (
              <li key={f} className="rounded-3xl border border-line bg-surface p-6">
                <Icon className="size-5 text-accent" />
                <p className="mt-5 font-display text-lg font-semibold">{f}</p>
              </li>
            );
          })}
        </ul>
      </section>
      <CtaBand t={t} locale={locale} />
    </>
  );
}
