import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formLabels } from "@/i18n/labels";
import { buildMetadata } from "@/server/seo";
import { getFeaturedCars, getLatestCars, getCarFacets, getRentalCars } from "@/server/services/car.service";
import { RentalCard } from "@/components/rent/rental-card";
import { listPosts } from "@/server/services/blog.service";
import { getContent, getFaq } from "@/server/services/content.service";
import { estimate, getCalculatorOptions } from "@/server/calculator/calculator.service";
import { calculatorInputFromParams } from "@/server/calculator/input";
import { Hero } from "@/components/home/hero";
import { QuickSearch } from "@/components/home/quick-search";
import { AppSection, CorporateSection, CtaBand, Faq, ImportTeaser, ProcessSteps, TrustSection } from "@/components/home/sections";
import { CarCard } from "@/components/cars/car-card";
import { BlogCard } from "@/components/blog/blog-card";
import { Calculator } from "@/components/calculator/calculator";
import { SectionHeader } from "@/components/ui/section";
import { buttonClasses } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getDictionary(locale);
  return buildMetadata({ locale, path: "/", title: t.meta.home.title, description: t.meta.home.description, absoluteTitle: true });
}

async function safe<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = (await params).locale as Locale;
  const t = await getDictionary(locale);

  const [hero, cta, trust, featured, latest, facets, posts, faq, options, rentals] = await Promise.all([
    getContent("home.hero", locale, t.hero),
    getContent("home.cta", locale, t.cta),
    getContent("home.trust", locale, t.trust),
    getFeaturedCars(6),
    getLatestCars(4),
    getCarFacets(),
    listPosts(locale, { take: 3 }),
    getFaq(locale),
    getCalculatorOptions(locale),
    getRentalCars(3),
  ]);

  const calcInput = calculatorInputFromParams({ fuel: "HYBRID", year: "2022", price: "12000", engine: "2.5" }, options);
  const sample = await safe(estimate(calcInput));
  const tHome = { ...t, hero, cta, trust };

  const faqLd = faq.items.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }
    : null;

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AutoHunt",
    url: absoluteUrl(`/${locale}`),
    inLanguage: locale,
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl(`/${locale}/cars`)}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <Hero locale={locale} t={tHome} sample={sample} />

      <QuickSearch
        locale={locale}
        t={t.quickSearch}
        brands={facets.brands.map((b) => ({ value: b.value, label: b.value }))}
        bodies={Object.entries(t.enums.body).map(([value, label]) => ({ value, label }))}
      />

      {/* Cars available in Armenia */}
      <section className="py-24 sm:py-32">
        <div className="container-page">
          <SectionHeader
            title={t.cars.title}
            subtitle={t.cars.subtitle}
            action={
              <Link href={href(locale, "/cars")} className={buttonClasses("outline")}>
                {t.common.viewAll}
                <ArrowRight className="size-4" />
              </Link>
            }
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((car, i) => (
              <CarCard key={car.id} car={car} locale={locale} t={t} priority={i < 3} />
            ))}
          </div>
        </div>
      </section>

      {/* ⭐ Total cost calculator */}
      <section className="relative overflow-hidden border-y border-line bg-surface py-24 sm:py-32" id="calculator">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(95_212_244/0.08),transparent_60%)]" aria-hidden />
        <div className="container-page relative">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="mb-4 text-xs font-medium tracking-[0.18em] text-accent uppercase">{t.calculator.eyebrow}</p>
            <h2 className="font-display text-3xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              <span className="text-muted">{t.calculator.title1}</span>{" "}
              <span className="bg-gradient-to-r from-fg via-accent to-positive bg-clip-text text-transparent">{t.calculator.title2}</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted">{t.calculator.subtitle}</p>
          </div>
          <Calculator
            variant="embedded"
            locale={locale}
            options={options}
            initialInput={calcInput}
            initialResult={sample}
            t={t.calculator}
            fuelLabels={t.enums.fuel}
            formT={formLabels(t)}
            fullHref={href(locale, "/calculator")}
          />
        </div>
      </section>

      {/* Car rental */}
      {rentals.length > 0 && (
        <section className="defer-render py-24 sm:py-32">
          <div className="container-page">
            <SectionHeader
              eyebrow={t.rent.eyebrow}
              title={t.rent.homeTitle}
              subtitle={t.rent.homeSubtitle}
              action={
                <Link href={href(locale, "/rent")} className={buttonClasses("outline")}>
                  {t.rent.viewAll}
                  <ArrowRight className="size-4" />
                </Link>
              }
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rentals.map((car) => (
                <RentalCard key={car.id} car={car} locale={locale} t={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSteps t={t} locale={locale} />
      <ImportTeaser t={t} locale={locale} />
      <CorporateSection t={t} locale={locale} />
      <AppSection t={t} locale={locale} />
      <TrustSection t={tHome} />

      {/* Latest cars */}
      <section className="defer-render py-24 sm:py-32">
        <div className="container-page">
          <SectionHeader
            title={t.cars.latestTitle}
            subtitle={t.cars.latestSubtitle}
            action={
              <Link href={href(locale, "/cars?sort=newest")} className={buttonClasses("outline")}>
                {t.common.viewAll}
                <ArrowRight className="size-4" />
              </Link>
            }
          />
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {latest.map((car) => (
              <div key={car.id} className="w-[82%] shrink-0 snap-start sm:w-auto">
                <CarCard car={car} locale={locale} t={t} compact />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      {posts.length > 0 && (
        <section className="defer-render border-t border-line py-24 sm:py-32">
          <div className="container-page">
            <SectionHeader
              eyebrow={t.blog.eyebrow}
              title={t.blog.homeTitle}
              subtitle={t.blog.subtitle}
              action={
                <Link href={href(locale, "/blog")} className={buttonClasses("outline")}>
                  {t.common.viewAll}
                  <ArrowRight className="size-4" />
                </Link>
              }
            />
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {posts.map((p) => (
                <BlogCard key={p.id} post={p} locale={locale} t={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Faq t={t} items={faq.items} />
      <CtaBand t={tHome} locale={locale} />

      <JsonLd data={faqLd ? [websiteLd, faqLd] : websiteLd} />
    </>
  );
}
