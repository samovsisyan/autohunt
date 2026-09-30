import type { Metadata } from "next";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { buildMetadata } from "@/server/seo";
import { PageHeader } from "@/components/layout/page-header";
import { CompareTable } from "@/components/cars/saved-lists";

export async function generateMetadata({ params }: PageProps<"/[locale]/compare">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getDictionary(locale);
  return buildMetadata({ locale, path: "/compare", title: t.meta.compare.title, description: t.meta.compare.description, noindex: true });
}

export default async function ComparePage({ params }: PageProps<"/[locale]/compare">) {
  const locale = (await params).locale as Locale;
  const t = await getDictionary(locale);
  const labels = { enums: t.enums, favorites: t.favorites, compare: t.compare, cars: t.cars, car: t.car, common: t.common };
  return (
    <>
      <PageHeader
        crumbs={[
          { name: t.nav.home, href: href(locale) },
          { name: t.compare.title, href: href(locale, "/compare") },
        ]}
        title={t.compare.title}
        className="pb-10"
      />
      <section className="container-page py-12">
        <CompareTable locale={locale} t={labels} />
      </section>
    </>
  );
}
