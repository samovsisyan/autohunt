import type { Metadata } from "next";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { buildMetadata } from "@/server/seo";
import { PageHeader } from "@/components/layout/page-header";
import { FavoritesList } from "@/components/cars/saved-lists";

export async function generateMetadata({ params }: PageProps<"/[locale]/favorites">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getDictionary(locale);
  return buildMetadata({ locale, path: "/favorites", title: t.meta.favorites.title, description: t.meta.favorites.description, noindex: true });
}

export default async function FavoritesPage({ params }: PageProps<"/[locale]/favorites">) {
  const locale = (await params).locale as Locale;
  const t = await getDictionary(locale);
  const labels = { enums: t.enums, favorites: t.favorites, compare: t.compare, cars: t.cars, car: t.car, common: t.common };
  return (
    <>
      <PageHeader
        crumbs={[
          { name: t.nav.home, href: href(locale) },
          { name: t.favorites.title, href: href(locale, "/favorites") },
        ]}
        title={t.favorites.title}
        className="pb-10"
      />
      <section className="container-page py-12">
        <FavoritesList locale={locale} t={labels} />
      </section>
    </>
  );
}
