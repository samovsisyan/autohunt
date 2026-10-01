import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, CheckCircle2, Cog, Fuel, Gauge, MapPin, ShieldCheck, Timer, Zap } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formLabels } from "@/i18n/labels";
import { fmt, formatNumber, formatUsd } from "@/i18n/format";
import { buildMetadata } from "@/server/seo";
import { getAllCarSlugs, getRentalCarBySlug, getRentalCars } from "@/server/services/car.service";
import { Breadcrumbs } from "@/components/layout/page-header";
import { CarGallery } from "@/components/cars/car-gallery";
import { RentalBooking } from "@/components/rent/rental-booking";
import { RentalCard } from "@/components/rent/rental-card";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/site";
import { carTitle } from "@/lib/car";

export const revalidate = 300;

export async function generateStaticParams() {
  const cars = await getAllCarSlugs("RENT").catch(() => []);
  return cars.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/rent/[slug]">): Promise<Metadata> {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  const [t, car] = await Promise.all([getDictionary(locale), getRentalCarBySlug(slug, locale)]);
  if (!car) return {};
  const title = car.t?.seoTitle || `${carTitle(car)} — ${t.rent.eyebrow}, ${formatUsd(car.price, locale)} ${t.rent.perDay}`;
  const description = car.t?.seoDescription || `${t.rent.eyebrow}: ${carTitle(car)}, ${t.enums.fuel[car.fuel]}, ${t.enums.transmission[car.transmission]}. ${car.location}. AutoHunt.`;
  return buildMetadata({ locale, path: `/rent/${slug}`, title, description, image: car.images[0]?.url });
}

export default async function RentalCarPage({ params }: PageProps<"/[locale]/rent/[slug]">) {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  const [t, car] = await Promise.all([getDictionary(locale), getRentalCarBySlug(slug, locale)]);
  if (!car) notFound();
  const others = (await getRentalCars(4)).filter((c) => c.id !== car.id).slice(0, 3);

  const title = carTitle(car);
  const free = car.status === "AVAILABLE";
  const minDays = Math.max(1, car.rentMinDays ?? 1);
  const facts = [
    { icon: Calendar, label: t.car.specs.year, value: String(car.year) },
    { icon: Fuel, label: t.car.specs.fuel, value: t.enums.fuel[car.fuel] },
    { icon: Cog, label: t.car.specs.transmission, value: t.enums.transmission[car.transmission] },
    { icon: Zap, label: t.car.specs.engine, value: car.engineVolume ? `${car.engineVolume.toFixed(1)}L` : "EV" },
    { icon: Gauge, label: t.car.specs.mileage, value: `${formatNumber(car.mileage, locale)} ${t.enums.mileageUnit[car.mileageUnit]}` },
    { icon: Cog, label: t.car.specs.drive, value: t.enums.drive[car.drive] },
  ];
  const url = absoluteUrl(href(locale, `/rent/${car.slug}`));
  const ld = {
    "@context": "https://schema.org",
    "@type": ["Product", "Car"],
    name: title,
    url,
    image: car.images.map((i) => absoluteUrl(i.url)),
    brand: { "@type": "Brand", name: car.brand },
    model: car.model,
    vehicleModelDate: String(car.year),
    fuelType: car.fuel,
    vehicleTransmission: car.transmission,
    offers: {
      "@type": "Offer",
      url,
      businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
      priceSpecification: { "@type": "UnitPriceSpecification", price: car.price, priceCurrency: "USD", unitCode: "DAY" },
      availability: free ? "https://schema.org/InStock" : "https://schema.org/LimitedAvailability",
      seller: { "@id": `${absoluteUrl("/")}#organization` },
    },
  };

  return (
    <>
      <div className="container-page pt-24 pb-16 sm:pt-28">
        <Breadcrumbs
          className="mb-6"
          items={[
            { name: t.nav.home, href: href(locale) },
            { name: t.nav.rent, href: href(locale, "/rent") },
            { name: title, href: href(locale, `/rent/${car.slug}`) },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr] lg:gap-10">
          <div className="min-w-0 space-y-12">
            <CarGallery images={car.images} title={title} photosLabel={t.car.photos.replace("{count}", String(car.images.length))} />

            <section aria-labelledby="specs">
              <h2 id="specs" className="font-display text-2xl font-semibold">{t.car.vehicleInfo}</h2>
              <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {facts.map((f) => (
                  <li key={f.label} className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5">
                    <f.icon className="size-4 shrink-0 text-subtle" aria-hidden />
                    <div className="min-w-0">
                      <p className="text-[11px] text-subtle">{f.label}</p>
                      <p className="truncate text-sm font-medium">{f.value}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {(car.t?.description || car.features.length > 0) && (
              <section aria-labelledby="about-car">
                <h2 id="about-car" className="font-display text-2xl font-semibold">{t.car.description}</h2>
                <div className="mt-5 space-y-4 leading-relaxed text-muted">
                  {car.t?.description.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
                </div>
                {car.features.length > 0 && (
                  <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                    {car.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-muted">
                        <CheckCircle2 className="size-4 shrink-0 text-positive" aria-hidden />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            <section aria-labelledby="terms" className="rounded-3xl border border-line bg-surface p-6">
              <h2 id="terms" className="font-display text-xl font-semibold">{t.rent.termsTitle}</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {t.rent.terms.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-positive" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start" aria-labelledby="book">
            <div className="rounded-3xl border border-line bg-surface p-6 sm:p-7">
              <Badge tone={free ? "positive" : "warning"} dot>
                {free ? t.rent.available : t.rent.rented}
              </Badge>
              <h1 className="mt-4 font-display text-3xl leading-tight font-semibold tracking-tight">{title}</h1>
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted">
                <MapPin className="size-3.5" /> {car.location}, Armenia
              </p>
              <div className="mt-6 flex flex-wrap items-end justify-between gap-3 border-t border-line pt-6">
                <p>
                  <span className="tabular font-display text-4xl font-semibold tracking-tight">{formatUsd(car.price, locale)}</span>
                  <span className="ml-1.5 text-muted">{t.rent.perDay}</span>
                </p>
                <div className="space-y-1 text-right text-xs text-subtle">
                  {car.rentDeposit ? (
                    <p className="inline-flex items-center gap-1">
                      <ShieldCheck className="size-3.5" /> {t.rent.deposit}: {formatUsd(car.rentDeposit, locale)}
                    </p>
                  ) : null}
                  {minDays > 1 && (
                    <p className="flex items-center justify-end gap-1">
                      <Timer className="size-3.5" /> {t.rent.minDays}: {fmt(t.rent.days, { count: minDays })}
                    </p>
                  )}
                </div>
              </div>

              <h2 id="book" className="mt-8 font-display text-xl font-semibold">{t.rent.booking.title}</h2>
              <p className="mt-1.5 text-sm text-muted">{free ? t.rent.booking.text : t.rent.booking.rentedNote}</p>
              <RentalBooking
                carId={car.id}
                carTitle={title}
                pricePerDay={car.price}
                minDays={minDays}
                locale={locale}
                t={t.rent}
                formT={formLabels(t)}
              />
            </div>
          </aside>
        </div>

        {others.length > 0 && (
          <section className="mt-24" aria-labelledby="more">
            <div className="mb-8 flex items-end justify-between">
              <h2 id="more" className="font-display text-2xl font-semibold sm:text-3xl">{t.rent.viewAll}</h2>
              <Link href={href(locale, "/rent")} className={buttonClasses("outline", "sm")}>
                {t.common.viewAll}
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((c) => (
                <RentalCard key={c.id} car={c} locale={locale} t={t} />
              ))}
            </div>
          </section>
        )}
      </div>
      <JsonLd data={ld} />
    </>
  );
}
