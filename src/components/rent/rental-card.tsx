import Image from "next/image";
import Link from "next/link";
import { Fuel, Cog, Users2, ShieldCheck } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fmt, formatUsd } from "@/i18n/format";
import { carName } from "@/lib/car";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import type { CarCardData } from "@/server/services/car.service";

export function RentalCard({ car, locale, t, priority }: { car: CarCardData; locale: Locale; t: Dictionary; priority?: boolean }) {
  const detail = href(locale, `/rent/${car.slug}`);
  const img = car.images[0];
  const free = car.status === "AVAILABLE";
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
      <div className="absolute top-3 left-3" data-theme="dark">
        <Badge tone={free ? "positive" : "warning"} dot className="bg-black/55 backdrop-blur-md">
          {free ? t.rent.available : t.rent.rented}
        </Badge>
      </div>

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
          <span className="inline-flex items-center gap-1.5">
            <Fuel className="size-3.5 text-subtle" />
            {t.enums.fuel[car.fuel]}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Cog className="size-3.5 text-subtle" />
            {t.enums.transmission[car.transmission]}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users2 className="size-3.5 text-subtle" />
            {t.enums.body[car.bodyType]}
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
          <p>
            <span className="tabular font-display text-2xl font-semibold tracking-tight">{formatUsd(car.price, locale)}</span>
            <span className="ml-1 text-sm text-muted">{t.rent.perDay}</span>
          </p>
          {car.rentDeposit ? (
            <p className="inline-flex items-center gap-1 text-xs text-subtle">
              <ShieldCheck className="size-3.5" />
              {t.rent.deposit} {formatUsd(car.rentDeposit, locale)}
            </p>
          ) : null}
        </div>
        {car.rentMinDays && car.rentMinDays > 1 ? (
          <p className="mt-1 text-xs text-subtle">
            {t.rent.minDays}: {fmt(t.rent.days, { count: car.rentMinDays })}
          </p>
        ) : null}
        <Link href={detail} className={buttonClasses(free ? "primary" : "secondary", "sm", "relative z-10 mt-4 w-full")}>
          {t.rent.details}
        </Link>
      </div>
    </article>
  );
}
