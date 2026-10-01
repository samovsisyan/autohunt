import Image from "next/image";
import Link from "next/link";
import { MapPin, Gauge, Fuel, Cog } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatNumber, formatUsd } from "@/i18n/format";
import { carName, vehicleTypeForBody } from "@/lib/car";
import { StatusBadge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import type { CarCardData } from "@/server/services/car.service";
import { CompareToggle, FavoriteButton } from "./car-actions";

export function calculatorHref(locale: Locale, car: Pick<CarCardData, "price" | "year" | "engineVolume" | "fuel" | "bodyType">) {
  const q = new URLSearchParams({
    price: String(car.price),
    year: String(car.year),
    engine: String(car.engineVolume ?? 0),
    fuel: car.fuel,
    vehicleType: vehicleTypeForBody(car.bodyType),
  });
  return `${href(locale, "/calculator")}?${q}`;
}

export function CarCard({
  car,
  locale,
  t,
  priority,
  compact,
}: {
  car: CarCardData;
  locale: Locale;
  t: Dictionary;
  priority?: boolean;
  compact?: boolean;
}) {
  const detail = href(locale, `/cars/${car.slug}`);
  const img = car.images[0];
  const specs = [
    car.engineVolume ? `${car.engineVolume.toFixed(1)}L` : null,
    t.enums.fuel[car.fuel],
    t.enums.transmission[car.transmission],
  ].filter(Boolean);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-line-strong">
      <Link href={detail} className="relative block aspect-[16/10] overflow-hidden bg-elevated" tabIndex={-1} aria-hidden>
        {img && (
          <Image
            src={img.url}
            alt={img.alt ?? carName(car)}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </Link>
      <div className="absolute top-3 left-3 flex gap-2" data-theme="dark">
        <StatusBadge status={car.status} label={t.enums.carStatus[car.status]} className="bg-black/55 backdrop-blur-md" />
      </div>
      <FavoriteButton id={car.id} labels={t.cars.card} className="absolute top-3 right-3" />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium tracking-[0.14em] text-subtle uppercase">{car.brand}</p>
          <p className="text-xs text-subtle tabular">{car.year}</p>
        </div>
        <h3 className="mt-1.5 font-display text-lg leading-snug font-semibold">
          <Link href={detail} className="after:absolute after:inset-0 after:content-[''] focus:outline-none">
            {car.model}
            {car.trim && <span className="text-muted"> {car.trim}</span>}
          </Link>
        </h3>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[0.8125rem] text-muted">
          <span className="inline-flex items-center gap-1.5 tabular">
            <Gauge className="size-3.5 text-subtle" />
            {formatNumber(car.mileage, locale)} {t.enums.mileageUnit[car.mileageUnit]}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Fuel className="size-3.5 text-subtle" />
            {specs.join(" · ")}
          </span>
          {!compact && (
            <span className="inline-flex items-center gap-1.5">
              <Cog className="size-3.5 text-subtle" />
              {t.enums.drive[car.drive]}
            </span>
          )}
        </div>

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
          <div>
            <p className="tabular font-display text-2xl font-semibold tracking-tight">{formatUsd(car.price, locale)}</p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-subtle">
              <MapPin className="size-3" /> {car.location}
            </p>
          </div>
          <div className="relative z-10">
            <CompareToggle id={car.id} labels={{ compare: t.cars.card.compare, limit: t.compare.limit }} />
          </div>
        </div>

        {!compact && (
          <div className="relative z-10 mt-4 grid grid-cols-2 gap-2">
            <Link href={detail} className={buttonClasses("secondary", "sm", "w-full")}>
              {t.common.viewDetails}
            </Link>
            <Link href={calculatorHref(locale, car)} className={buttonClasses("ghost", "sm", "w-full border border-line")}>
              {t.common.calculateCost}
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
