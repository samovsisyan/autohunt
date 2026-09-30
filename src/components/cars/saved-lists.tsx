"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, GitCompareArrows, X } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatNumber, formatUsd } from "@/i18n/format";
import { compareStore, favoritesStore } from "@/lib/saved-store";
import { EmptyState, Skeleton } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { FavoriteButton } from "./car-actions";

type ApiCar = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  trim: string | null;
  year: number;
  mileage: number;
  mileageUnit: "MI" | "KM";
  engineVolume: number | null;
  horsepower: number | null;
  fuel: keyof Dictionary["enums"]["fuel"];
  transmission: keyof Dictionary["enums"]["transmission"];
  drive: keyof Dictionary["enums"]["drive"];
  bodyType: keyof Dictionary["enums"]["body"];
  price: number;
  location: string;
  status: keyof Dictionary["enums"]["carStatus"];
  color: string | null;
  images: { url: string; alt: string | null }[];
};

function useCars(ids: string[]) {
  const [state, setState] = useState<{ key: string; items: ApiCar[] } | null>(null);
  const key = ids.join(",");
  useEffect(() => {
    if (!key) return;
    const ctrl = new AbortController();
    fetch(`/api/cars?ids=${encodeURIComponent(key)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => setState({ key, items: d.items }))
      .catch(() => {});
    return () => ctrl.abort();
  }, [key]);
  if (!key) return [];
  // Keep showing the previous list while a new one loads (e.g. after removing an item).
  return state ? state.items.filter((c) => ids.includes(c.id)) : null;
}

type Labels = Pick<Dictionary, "enums" | "favorites" | "compare" | "cars" | "car" | "common">;

export function FavoritesList({ locale, t }: { locale: Locale; t: Labels }) {
  const ids = favoritesStore.use();
  const cars = useCars(ids);
  if (cars === null) return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="aspect-[4/3] rounded-3xl" />)}</div>;
  if (!cars.length)
    return <EmptyState icon={Heart} title={t.favorites.title} text={t.favorites.empty} action={<Link href={`/${locale}/cars`} className={buttonClasses("primary")}>{t.cars.title}</Link>} />;
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cars.map((c) => (
        <article key={c.id} className="group relative overflow-hidden rounded-3xl border border-line bg-surface">
          <div className="relative aspect-[16/10]">
            {c.images[0] && <Image src={c.images[0].url} alt="" fill sizes="(min-width: 1024px) 400px, 100vw" className="object-cover" />}
          </div>
          <FavoriteButton id={c.id} labels={t.cars.card} className="absolute top-3 right-3 z-10" />
          <div className="p-5">
            <p className="text-xs tracking-[0.14em] text-subtle uppercase">{c.brand}</p>
            <h2 className="mt-1 font-display text-lg font-semibold">
              <Link href={`/${locale}/cars/${c.slug}`} className="after:absolute after:inset-0">
                {c.year} {c.model} {c.trim}
              </Link>
            </h2>
            <p className="mt-3 tabular font-display text-2xl font-semibold">{formatUsd(c.price, locale)}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export function CompareTable({ locale, t }: { locale: Locale; t: Labels }) {
  const ids = compareStore.use();
  const cars = useCars(ids);
  if (cars === null) return <Skeleton className="h-96 rounded-3xl" />;
  if (!cars.length)
    return <EmptyState icon={GitCompareArrows} title={t.compare.title} text={t.compare.empty} action={<Link href={`/${locale}/cars`} className={buttonClasses("primary")}>{t.cars.title}</Link>} />;

  const minPrice = Math.min(...cars.map((c) => c.price));
  const minMileage = Math.min(...cars.map((c) => c.mileage));
  const rows: { label: string; value: (c: ApiCar) => React.ReactNode; best?: (c: ApiCar) => boolean }[] = [
    { label: t.car.stickyPrice, value: (c) => formatUsd(c.price, locale), best: (c) => cars.length > 1 && c.price === minPrice },
    { label: t.car.specs.year, value: (c) => c.year },
    { label: t.car.specs.mileage, value: (c) => `${formatNumber(c.mileage, locale)} ${t.enums.mileageUnit[c.mileageUnit]}`, best: (c) => cars.length > 1 && c.mileage === minMileage },
    { label: t.car.specs.engine, value: (c) => (c.engineVolume ? `${c.engineVolume.toFixed(1)} L` : "EV") },
    { label: t.car.specs.power, value: (c) => (c.horsepower ? `${c.horsepower} hp` : "—") },
    { label: t.car.specs.fuel, value: (c) => t.enums.fuel[c.fuel] },
    { label: t.car.specs.transmission, value: (c) => t.enums.transmission[c.transmission] },
    { label: t.car.specs.drive, value: (c) => t.enums.drive[c.drive] },
    { label: t.car.specs.body, value: (c) => t.enums.body[c.bodyType] },
    { label: t.car.specs.color, value: (c) => c.color ?? "—" },
    { label: t.car.specs.location, value: (c) => c.location },
    { label: t.car.specs.status, value: (c) => t.enums.carStatus[c.status] },
  ];

  return (
    <div className="overflow-x-auto rounded-3xl border border-line">
      <table className="w-full min-w-[640px] table-fixed text-sm">
        <thead>
          <tr>
            <th className="w-40 p-4" />
            {cars.map((c) => (
              <th key={c.id} className="p-4 text-left align-top font-normal">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                  {c.images[0] && <Image src={c.images[0].url} alt="" fill sizes="320px" className="object-cover" />}
                  <button onClick={() => compareStore.remove(c.id)} className="glass absolute top-2 right-2 grid size-8 place-items-center rounded-full" aria-label={t.common.remove}>
                    <X className="size-4" />
                  </button>
                </div>
                <Link href={`/${locale}/cars/${c.slug}`} className="mt-3 block font-display text-base font-semibold hover:text-accent">
                  {c.year} {c.brand} {c.model}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t border-line">
              <th scope="row" className="p-4 text-left font-normal text-subtle">{r.label}</th>
              {cars.map((c) => (
                <td key={c.id} className={r.best?.(c) ? "p-4 font-medium text-positive" : "p-4"}>
                  {r.value(c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
