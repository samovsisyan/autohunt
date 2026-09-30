import type { Metadata } from "next";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formLabels } from "@/i18n/labels";
import { buildMetadata } from "@/server/seo";
import { estimate, getCalculatorOptions } from "@/server/calculator/calculator.service";
import { calculatorInputFromParams } from "@/server/calculator/input";
import { Breadcrumbs } from "@/components/layout/page-header";
import { Calculator } from "@/components/calculator/calculator";
import { ProcessSteps, Faq } from "@/components/home/sections";
import { getFaq } from "@/server/services/content.service";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/site";

export async function generateMetadata({ params, searchParams }: PageProps<"/[locale]/calculator">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getDictionary(locale);
  const meta = await buildMetadata({ locale, path: "/calculator", title: t.meta.calculator.title, description: t.meta.calculator.description });
  if (Object.keys(await searchParams).length) meta.robots = { index: false, follow: true };
  return meta;
}

export default async function CalculatorPage({ params, searchParams }: PageProps<"/[locale]/calculator">) {
  const locale = (await params).locale as Locale;
  const [t, options, faq] = await Promise.all([getDictionary(locale), getCalculatorOptions(locale), getFaq(locale)]);
  const input = calculatorInputFromParams(await searchParams, options);
  const result = await estimate(input).catch(() => null);

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t.meta.calculator.title,
    url: absoluteUrl(href(locale, "/calculator")),
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
  };

  return (
    <>
      <section className="relative overflow-hidden pt-24 pb-24 sm:pt-28">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[1000px] -translate-x-1/2 rounded-full bg-accent/[0.08] blur-3xl" aria-hidden />
        <div className="container-page relative">
          <Breadcrumbs
            className="mb-10"
            items={[
              { name: t.nav.home, href: href(locale) },
              { name: t.nav.calculator, href: href(locale, "/calculator") },
            ]}
          />
          <div className="mb-12 max-w-4xl">
            <p className="mb-4 text-xs font-medium tracking-[0.18em] text-accent uppercase">{t.calculator.eyebrow}</p>
            <h1 className="font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
              <span className="text-muted">{t.calculator.title1}</span>{" "}
              <span className="bg-gradient-to-r from-fg via-accent to-positive bg-clip-text text-transparent">{t.calculator.title2}</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted">{t.calculator.subtitle}</p>
          </div>
          <Calculator
            locale={locale}
            options={options}
            initialInput={input}
            initialResult={result}
            t={t.calculator}
            fuelLabels={t.enums.fuel}
            formT={formLabels(t)}
          />
        </div>
      </section>
      <div className="border-t border-line">
        <ProcessSteps t={t} locale={locale} />
      </div>
      <Faq t={t} items={faq.items} />
      <JsonLd data={appLd} />
    </>
  );
}
