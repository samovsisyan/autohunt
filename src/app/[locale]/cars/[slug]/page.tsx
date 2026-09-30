import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  Gauge,
  Fuel,
  Cog,
  Zap,
  MapPin,
  FileText,
  ShieldCheck,
  Users,
  AlertTriangle,
  Wrench,
  Hash,
  CheckCircle2,
  Calculator as CalcIcon,
  Download,
} from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formLabels } from "@/i18n/labels";
import { formatNumber, formatUsd } from "@/i18n/format";
import { buildMetadata } from "@/server/seo";
import { getAllCarSlugs, getCarBySlug, getSimilarCars } from "@/server/services/car.service";
import { Breadcrumbs } from "@/components/layout/page-header";
import { CarGallery } from "@/components/cars/car-gallery";
import { CarRequestActions } from "@/components/cars/car-request-actions";
import { CarCard, calculatorHref } from "@/components/cars/car-card";
import { FavoriteButton } from "@/components/cars/car-actions";
import { RequestForm } from "@/components/forms/request-form";
import { StatusBadge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/site";
import { carTitle } from "@/lib/car";

export const revalidate = 300;

export async function generateStaticParams() {
  const cars = await getAllCarSlugs().catch(() => []);
  return cars.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/cars/[slug]">): Promise<Metadata> {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  const car = await getCarBySlug(slug, locale);
  if (!car) return {};
  const title = car.t?.seoTitle || `${carTitle(car)} — ${formatUsd(car.price, "en")}`;
  const description =
    car.t?.seoDescription ||
    `${carTitle(car)}, ${formatNumber(car.mileage, locale)} ${car.mileageUnit.toLowerCase()}, ${car.engineVolume ? `${car.engineVolume}L ` : ""}${car.fuel.toLowerCase()}. ${car.location}, Armenia. AutoHunt.`;
  return buildMetadata({ locale, path: `/cars/${slug}`, title, description, image: car.images[0]?.url });
}

export default async function CarPage({ params }: PageProps<"/[locale]/cars/[slug]">) {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  const [t, car] = await Promise.all([getDictionary(locale), getCarBySlug(slug, locale)]);
  if (!car) notFound();
  const similar = await getSimilarCars(car);

  const title = carTitle(car);
  const price = formatUsd(car.price, locale);
  const mileage = `${formatNumber(car.mileage, locale)} ${t.enums.mileageUnit[car.mileageUnit]}`;
  const history = (car.history ?? {}) as { owners?: number; accidents?: number; titleStatus?: string; serviceRecords?: number; lotNumber?: string };

  const keyFacts = [
    { icon: Calendar, label: t.car.specs.year, value: String(car.year) },
    { icon: Gauge, label: t.car.specs.mileage, value: mileage },
    { icon: Zap, label: t.car.specs.engine, value: car.engineVolume ? `${car.engineVolume.toFixed(1)}L` : "EV" },
    { icon: Fuel, label: t.car.specs.fuel, value: t.enums.fuel[car.fuel] },
    { icon: Cog, label: t.car.specs.transmission, value: t.enums.transmission[car.transmission] },
    { icon: Cog, label: t.car.specs.drive, value: t.enums.drive[car.drive] },
  ];

  const specs: [string, string | null | undefined][] = [
    [t.car.specs.year, String(car.year)],
    [t.car.specs.mileage, mileage],
    [t.car.specs.engine, car.engineVolume ? `${car.engineVolume.toFixed(1)} L` : "—"],
    [t.car.specs.power, car.horsepower ? `${car.horsepower} hp` : null],
    [t.car.specs.fuel, t.enums.fuel[car.fuel]],
    [t.car.specs.transmission, t.enums.transmission[car.transmission]],
    [t.car.specs.drive, t.enums.drive[car.drive]],
    [t.car.specs.body, t.enums.body[car.bodyType]],
    [t.car.specs.color, car.color],
    [t.car.specs.interior, car.interior],
    [t.car.specs.vin, car.vin],
    [t.car.specs.location, car.location],
    [t.car.specs.source, car.source],
    [t.car.specs.status, t.enums.carStatus[car.status]],
  ];

  const historyItems = [
    { icon: Users, label: t.car.history.owners, value: history.owners },
    { icon: AlertTriangle, label: t.car.history.accidents, value: history.accidents },
    { icon: ShieldCheck, label: t.car.history.titleStatus, value: history.titleStatus },
    { icon: Wrench, label: t.car.history.serviceRecords, value: history.serviceRecords },
    { icon: Hash, label: t.car.history.lotNumber, value: history.lotNumber },
  ].filter((h) => h.value !== undefined && h.value !== null);

  const url = absoluteUrl(href(locale, `/cars/${car.slug}`));
  const carLd = {
    "@context": "https://schema.org",
    "@type": ["Product", "Car"],
    name: title,
    url,
    image: car.images.map((i) => absoluteUrl(i.url)),
    description: car.t?.description?.split("\n")[0],
    brand: { "@type": "Brand", name: car.brand },
    model: car.model,
    vehicleModelDate: String(car.year),
    productionDate: String(car.year),
    color: car.color ?? undefined,
    vehicleIdentificationNumber: car.vin ?? undefined,
    bodyType: car.bodyType,
    fuelType: car.fuel,
    vehicleTransmission: car.transmission,
    driveWheelConfiguration: car.drive,
    mileageFromOdometer: { "@type": "QuantitativeValue", value: car.mileage, unitCode: car.mileageUnit === "MI" ? "SMI" : "KMT" },
    vehicleEngine: car.engineVolume
      ? { "@type": "EngineSpecification", engineDisplacement: { "@type": "QuantitativeValue", value: car.engineVolume, unitCode: "LTR" } }
      : undefined,
    itemCondition: "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      url,
      price: car.price,
      priceCurrency: "USD",
      availability:
        car.status === "AVAILABLE" ? "https://schema.org/InStock" : car.status === "SOLD" ? "https://schema.org/SoldOut" : "https://schema.org/PreOrder",
      seller: { "@id": `${absoluteUrl("/")}#organization` },
      areaServed: "AM",
    },
  };

  const actionLabels = { request: t.car.request, financing: t.car.financing, close: t.common.close, stickyPrice: t.car.stickyPrice };

  return (
    <>
      <div className="container-page pt-24 pb-16 sm:pt-28">
        <Breadcrumbs
          className="mb-6"
          items={[
            { name: t.nav.home, href: href(locale) },
            { name: t.nav.cars, href: href(locale, "/cars") },
            { name: title, href: href(locale, `/cars/${car.slug}`) },
          ]}
        />

        {/* Top: gallery + summary */}
        <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr] lg:gap-10">
          <CarGallery images={car.images} title={title} photosLabel={t.car.photos.replace("{count}", String(car.images.length))} />

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-line bg-surface p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <StatusBadge status={car.status} label={t.enums.carStatus[car.status]} />
                <FavoriteButton id={car.id} labels={t.cars.card} className="size-10 border border-line bg-transparent" />
              </div>
              <h1 className="mt-4 font-display text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">{title}</h1>
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted">
                <MapPin className="size-3.5" /> {car.location}, Armenia
              </p>
              <div className="mt-6 border-t border-line pt-6">
                <p className="tabular font-display text-4xl font-semibold tracking-tight">{price}</p>
                <p className="mt-1 text-xs text-subtle">{t.car.priceNote}</p>
              </div>
              <ul className="mt-6 grid grid-cols-2 gap-2.5">
                {keyFacts.map((f) => (
                  <li key={f.label} className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] px-3 py-2.5">
                    <f.icon className="size-4 shrink-0 text-subtle" aria-hidden />
                    <div className="min-w-0">
                      <p className="text-[11px] text-subtle">{f.label}</p>
                      <p className="truncate text-sm font-medium">{f.value}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <CarRequestActions carId={car.id} carTitle={title} price={price} locale={locale} labels={actionLabels} formT={formLabels(t)} />
              </div>
              <Link href={calculatorHref(locale, car)} className="mt-4 inline-flex items-center gap-2 text-sm text-accent hover:underline">
                <CalcIcon className="size-4" />
                {t.car.calculate}
              </Link>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-16 grid gap-12 lg:grid-cols-[1.55fr_1fr] lg:gap-10">
          <div className="space-y-16">
            <section aria-labelledby="overview">
              <h2 id="overview" className="font-display text-2xl font-semibold">{t.car.description}</h2>
              <div className="mt-5 space-y-4 leading-relaxed text-muted">
                {car.t?.description.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
              </div>
              {car.features.length > 0 && (
                <>
                  <h3 className="mt-8 text-sm font-medium text-fg">{t.car.features}</h3>
                  <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {car.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-muted">
                        <CheckCircle2 className="size-4 shrink-0 text-positive" aria-hidden />
                        {f}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            <section aria-labelledby="specs">
              <h2 id="specs" className="font-display text-2xl font-semibold">{t.car.vehicleInfo}</h2>
              <dl className="mt-6 grid overflow-hidden rounded-2xl border border-line sm:grid-cols-2">
                {specs
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5 text-sm sm:odd:border-r">
                      <dt className="text-subtle">{k}</dt>
                      <dd className="text-right font-medium break-all">{v}</dd>
                    </div>
                  ))}
              </dl>
            </section>

            {car.images.length > 1 && (
              <section aria-labelledby="gallery">
                <h2 id="gallery" className="font-display text-2xl font-semibold">{t.car.gallery}</h2>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {car.images.map((img, i) => (
                    <div key={img.id} className={i === 0 ? "relative col-span-2 aspect-[16/9] overflow-hidden rounded-2xl" : "relative aspect-[4/3] overflow-hidden rounded-2xl"}>
                      <Image src={img.url} alt={img.alt ?? title} fill loading="lazy" sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section aria-labelledby="history">
              <h2 id="history" className="font-display text-2xl font-semibold">{t.car.documents}</h2>
              {historyItems.length > 0 && (
                <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {historyItems.map((h) => (
                    <div key={h.label} className="rounded-2xl border border-line bg-surface p-4">
                      <h.icon className="size-4 text-accent" aria-hidden />
                      <dt className="mt-3 text-xs text-subtle">{h.label}</dt>
                      <dd className="mt-1 font-medium">{String(h.value)}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {car.documents.length ? (
                <ul className="mt-4 divide-y divide-line rounded-2xl border border-line">
                  {car.documents.map((d) => (
                    <li key={d.id}>
                      <a href={d.url} target="_blank" rel="noopener" className="flex items-center justify-between gap-4 px-5 py-4 text-sm hover:bg-white/[0.02]">
                        <span className="inline-flex items-center gap-3">
                          <FileText className="size-4 text-subtle" />
                          {t.enums.docType[d.type]}
                          <span className="text-subtle">· {d.title}</span>
                        </span>
                        <Download className="size-4 text-subtle" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-muted">{t.car.noDocuments}</p>
              )}
            </section>
          </div>

          <aside aria-labelledby="contact" className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-line bg-surface p-6 sm:p-7">
              <h2 id="contact" className="font-display text-xl font-semibold">{t.car.contact}</h2>
              <p className="mt-2 text-sm text-muted">{t.car.contactText}</p>
              <RequestForm type="CONTACT" locale={locale} t={formLabels(t)} carId={car.id} columns={1} className="mt-6" defaults={{ message: `${title} — ` }} />
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-24" aria-labelledby="similar">
            <div className="mb-8 flex items-end justify-between">
              <h2 id="similar" className="font-display text-2xl font-semibold sm:text-3xl">{t.car.similar}</h2>
              <Link href={href(locale, "/cars")} className={buttonClasses("outline", "sm")}>
                {t.common.viewAll}
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((c) => (
                <CarCard key={c.id} car={c} locale={locale} t={t} />
              ))}
            </div>
          </section>
        )}
      </div>

      <CarRequestActions variant="sticky" carId={car.id} carTitle={title} price={price} locale={locale} labels={actionLabels} formT={formLabels(t)} />
      <JsonLd data={carLd} />
    </>
  );
}
