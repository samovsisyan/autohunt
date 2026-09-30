import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { buildMetadata } from "@/server/seo";
import { getCarFacets, parseCarFilters, searchCars } from "@/server/services/car.service";
import { PageHeader } from "@/components/layout/page-header";
import { CarCard } from "@/components/cars/car-card";
import { CarFiltersSidebar, CarToolbar } from "@/components/cars/car-filters";
import { CompareBar } from "@/components/cars/compare-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/site";
import { carTitle } from "@/lib/car";

export async function generateMetadata({ params, searchParams }: PageProps<"/[locale]/cars">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const sp = await searchParams;
  const t = await getDictionary(locale);
  const meta = await buildMetadata({ locale, path: "/cars", title: t.meta.cars.title, description: t.meta.cars.description });
  // Filtered/sorted/paginated variants canonicalize to the base listing and are not indexed.
  if (Object.keys(sp).length) meta.robots = { index: false, follow: true };
  return meta;
}

export default async function CarsPage({ params, searchParams }: PageProps<"/[locale]/cars">) {
  const locale = (await params).locale as Locale;
  const sp = await searchParams;
  const t = await getDictionary(locale);
  const filters = parseCarFilters(sp);
  const [result, facets] = await Promise.all([searchCars(filters), getCarFacets()]);
  const labels = { cars: t.cars, enums: t.enums, common: t.common };

  const pageHref = (p: number) => {
    const q = new URLSearchParams(Object.entries(sp).flatMap(([k, v]) => (typeof v === "string" ? [[k, v]] : [])));
    if (p > 1) q.set("page", String(p));
    else q.delete("page");
    return `${href(locale, "/cars")}${q.size ? `?${q}` : ""}`;
  };

  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: result.items.map((c, i) => ({
      "@type": "ListItem",
      position: (result.page - 1) * 12 + i + 1,
      url: absoluteUrl(href(locale, `/cars/${c.slug}`)),
      name: carTitle(c),
    })),
  };

  return (
    <>
      <PageHeader
        crumbs={[
          { name: t.nav.home, href: href(locale) },
          { name: t.nav.cars, href: href(locale, "/cars") },
        ]}
        title={t.cars.title}
        subtitle={t.cars.subtitle}
        className="pb-10 sm:pb-12"
      />
      <section className="container-page py-10">
        <div className="grid gap-8 lg:grid-cols-[290px_1fr]">
          <CarFiltersSidebar facets={facets} t={labels} />
          <div>
            <CarToolbar facets={facets} t={labels} total={result.total} />
            <h2 className="sr-only">{t.cars.results.replace("{count}", String(result.total))}</h2>
            {result.items.length ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((car, i) => (
                  <CarCard key={car.id} car={car} locale={locale} t={t} priority={i < 3} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={SearchX}
                title={t.cars.emptyTitle}
                text={t.cars.emptyText}
                action={<Button href={href(locale, "/import#search")}>{t.cars.emptyCta}</Button>}
              />
            )}
            <Pagination page={result.page} pages={result.pages} hrefFor={pageHref} />
          </div>
        </div>
      </section>
      <CompareBar compareHref={href(locale, "/compare")} labels={{ bar: t.compare.bar, open: t.compare.open, clear: t.common.reset }} />
      <JsonLd data={listLd} />
    </>
  );
}
