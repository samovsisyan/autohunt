import type { Metadata } from "next";
import { CarFront, CheckCircle2, KeyRound, Send } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formLabels } from "@/i18n/labels";
import { buildMetadata } from "@/server/seo";
import { getRentalCars } from "@/server/services/car.service";
import { PageHeader } from "@/components/layout/page-header";
import { RentalCard } from "@/components/rent/rental-card";
import { RequestForm } from "@/components/forms/request-form";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/site";
import { carTitle } from "@/lib/car";

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps<"/[locale]/rent">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getDictionary(locale);
  return buildMetadata({ locale, path: "/rent", title: t.meta.rent.title, description: t.meta.rent.description });
}

export default async function RentPage({ params }: PageProps<"/[locale]/rent">) {
  const locale = (await params).locale as Locale;
  const [t, cars] = await Promise.all([getDictionary(locale), getRentalCars()]);
  const stepIcons = [CarFront, Send, KeyRound];

  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: cars.map((c, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(href(locale, `/rent/${c.slug}`)), name: carTitle(c) })),
  };

  return (
    <>
      <PageHeader
        crumbs={[
          { name: t.nav.home, href: href(locale) },
          { name: t.nav.rent, href: href(locale, "/rent") },
        ]}
        eyebrow={t.rent.eyebrow}
        title={t.rent.title}
        subtitle={t.rent.subtitle}
        className="pb-10 sm:pb-12"
      />

      <section className="container-page py-10" aria-label={t.rent.title}>
        {cars.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {cars.map((car, i) => (
              <RentalCard key={car.id} car={car} locale={locale} t={t} priority={i < 3} />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-2xl rounded-3xl border border-line bg-surface p-6 sm:p-8">
            <h2 className="font-display text-2xl font-semibold">{t.rent.emptyTitle}</h2>
            <p className="mt-2 text-muted">{t.rent.emptyText}</p>
            <RequestForm type="CONTACT" locale={locale} t={formLabels(t)} className="mt-6" defaults={{ message: `${t.rent.eyebrow} — ` }} />
          </div>
        )}
      </section>

      <section className="container-page grid gap-6 py-16 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">{t.rent.stepsTitle}</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {t.rent.steps.map((s, i) => {
              const Icon = stepIcons[i] ?? CarFront;
              return (
                <li key={s.title} className="rounded-2xl border border-line bg-surface p-5">
                  <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-medium">
                    <span className="mr-1.5 text-subtle tabular">{i + 1}.</span>
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.text}</p>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="rounded-3xl border border-line bg-surface p-6 lg:mt-14">
          <h2 className="font-display text-xl font-semibold">{t.rent.termsTitle}</h2>
          <ul className="mt-4 space-y-3">
            {t.rent.terms.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-positive" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <JsonLd data={listLd} />
    </>
  );
}
