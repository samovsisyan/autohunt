import "server-only";
import { db } from "@/server/db";
import type { Prisma } from "@/generated/prisma/client";
import type { BodyType, Drive, FuelType, Transmission } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/config";

export const PAGE_SIZE = 12;

export interface CarFilters {
  q?: string;
  brand?: string[];
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  fuel?: FuelType[];
  engineMin?: number;
  engineMax?: number;
  transmission?: Transmission[];
  body?: BodyType[];
  drive?: Drive[];
  location?: string[];
  sort?: "newest" | "priceAsc" | "priceDesc" | "yearDesc" | "mileageAsc";
  page?: number;
}

type SP = Record<string, string | string[] | undefined>;

const list = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v : v ? v.split(",") : []).map((s) => s.trim()).filter(Boolean);
const num = (v: string | string[] | undefined) => {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

/** Parse URL search params into typed filters (unknown enum values are dropped by Prisma validation below). */
export function parseCarFilters(sp: SP): CarFilters {
  const sort = str(sp.sort);
  return {
    q: str(sp.q),
    brand: list(sp.brand),
    model: str(sp.model),
    yearMin: num(sp.yearMin),
    yearMax: num(sp.yearMax),
    priceMin: num(sp.priceMin),
    priceMax: num(sp.priceMax),
    mileageMax: num(sp.mileageMax),
    fuel: list(sp.fuel).filter(isIn(["GASOLINE", "DIESEL", "HYBRID", "PLUGIN_HYBRID", "ELECTRIC"])) as FuelType[],
    engineMin: num(sp.engineMin),
    engineMax: num(sp.engineMax),
    transmission: list(sp.transmission).filter(isIn(["AUTOMATIC", "MANUAL", "CVT", "ROBOTIC"])) as Transmission[],
    body: list(sp.body).filter(
      isIn(["SEDAN", "SUV", "CROSSOVER", "HATCHBACK", "COUPE", "WAGON", "PICKUP", "MINIVAN", "CONVERTIBLE"]),
    ) as BodyType[],
    drive: list(sp.drive).filter(isIn(["FWD", "RWD", "AWD", "FOUR_WD"])) as Drive[],
    location: list(sp.location),
    sort: (["newest", "priceAsc", "priceDesc", "yearDesc", "mileageAsc"] as const).find((s) => s === sort) ?? "newest",
    page: num(sp.page) ?? 1,
  };
}

function isIn(values: string[]) {
  return (v: string) => values.includes(v);
}

/** Everything under /cars is for sale; rental cars are listed separately under /rent. */
const FOR_SALE = { listingType: "SALE" } as const satisfies Prisma.CarWhereInput;

function buildWhere(f: CarFilters): Prisma.CarWhereInput {
  const and: Prisma.CarWhereInput[] = [FOR_SALE, { published: true }, { status: { not: "SOLD" } }];
  if (f.q) {
    for (const term of f.q.split(/\s+/).slice(0, 4)) {
      and.push({
        OR: [
          { brand: { contains: term, mode: "insensitive" } },
          { model: { contains: term, mode: "insensitive" } },
          { trim: { contains: term, mode: "insensitive" } },
        ],
      });
    }
  }
  if (f.brand?.length) and.push({ brand: { in: f.brand, mode: "insensitive" } });
  if (f.model) and.push({ model: { equals: f.model, mode: "insensitive" } });
  if (f.yearMin || f.yearMax) and.push({ year: { gte: f.yearMin, lte: f.yearMax } });
  if (f.priceMin || f.priceMax) and.push({ price: { gte: f.priceMin, lte: f.priceMax } });
  if (f.mileageMax) and.push({ mileage: { lte: f.mileageMax } });
  if (f.engineMin || f.engineMax) and.push({ engineVolume: { gte: f.engineMin, lte: f.engineMax } });
  if (f.fuel?.length) and.push({ fuel: { in: f.fuel } });
  if (f.transmission?.length) and.push({ transmission: { in: f.transmission } });
  if (f.body?.length) and.push({ bodyType: { in: f.body } });
  if (f.drive?.length) and.push({ drive: { in: f.drive } });
  if (f.location?.length) and.push({ location: { in: f.location } });
  return { AND: and };
}

const orderBy: Record<NonNullable<CarFilters["sort"]>, Prisma.CarOrderByWithRelationInput[]> = {
  newest: [{ featured: "desc" }, { createdAt: "desc" }],
  priceAsc: [{ price: "asc" }],
  priceDesc: [{ price: "desc" }],
  yearDesc: [{ year: "desc" }, { createdAt: "desc" }],
  mileageAsc: [{ mileage: "asc" }],
};

export const carCardSelect = {
  id: true,
  slug: true,
  brand: true,
  model: true,
  trim: true,
  year: true,
  mileage: true,
  mileageUnit: true,
  engineVolume: true,
  fuel: true,
  transmission: true,
  drive: true,
  bodyType: true,
  price: true,
  location: true,
  status: true,
  source: true,
  listingType: true,
  rentDeposit: true,
  rentMinDays: true,
  images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true, alt: true } },
} satisfies Prisma.CarSelect;

export type CarCardData = Prisma.CarGetPayload<{ select: typeof carCardSelect }>;

export async function searchCars(f: CarFilters) {
  const where = buildWhere(f);
  const page = Math.max(1, f.page ?? 1);
  const [items, total] = await Promise.all([
    db.car.findMany({
      where,
      orderBy: orderBy[f.sort ?? "newest"],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: carCardSelect,
    }),
    db.car.count({ where }),
  ]);
  return { items, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Distinct values for filter UIs, computed from the live inventory. */
export async function getCarFacets() {
  const where: Prisma.CarWhereInput = { ...FOR_SALE, published: true, status: { not: "SOLD" } };
  const [brands, models, locations, agg] = await Promise.all([
    db.car.groupBy({ by: ["brand"], where, _count: true, orderBy: { brand: "asc" } }),
    db.car.groupBy({ by: ["brand", "model"], where, orderBy: { model: "asc" } }),
    db.car.groupBy({ by: ["location"], where, _count: true, orderBy: { location: "asc" } }),
    db.car.aggregate({ where, _min: { price: true, year: true }, _max: { price: true, year: true, mileage: true } }),
  ]);
  return {
    brands: brands.map((b) => ({ value: b.brand, count: b._count })),
    models: models.map((m) => ({ brand: m.brand, model: m.model })),
    locations: locations.map((l) => ({ value: l.location, count: l._count })),
    priceMin: agg._min.price ?? 0,
    priceMax: agg._max.price ?? 0,
    yearMin: agg._min.year ?? 2000,
    yearMax: agg._max.year ?? new Date().getFullYear(),
  };
}

export type CarFacets = Awaited<ReturnType<typeof getCarFacets>>;

export async function getFeaturedCars(take = 6) {
  return db.car.findMany({
    where: { ...FOR_SALE, published: true, status: { in: ["AVAILABLE", "RESERVED"] } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take,
    select: carCardSelect,
  });
}

export async function getLatestCars(take = 4) {
  return db.car.findMany({
    where: { ...FOR_SALE, published: true, status: { not: "SOLD" } },
    orderBy: { createdAt: "desc" },
    take,
    select: carCardSelect,
  });
}

export async function getCarsByIds(ids: string[]) {
  if (!ids.length) return [];
  const cars = await db.car.findMany({
    where: { id: { in: ids.slice(0, 24) }, ...FOR_SALE, published: true },
    select: { ...carCardSelect, horsepower: true, color: true, features: true },
  });
  return ids.map((id) => cars.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => !!c);
}

export async function getCarBySlug(slug: string, locale: Locale) {
  const car = await db.car.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      documents: true,
      translations: true,
    },
  });
  if (!car || !car.published) return null;
  const t = car.translations.find((x) => x.locale === locale) ?? car.translations.find((x) => x.locale === "en");
  return { ...car, t };
}

export type CarDetail = NonNullable<Awaited<ReturnType<typeof getCarBySlug>>>;

export async function getSimilarCars(car: { id: string; bodyType: BodyType; price: number }, take = 3) {
  return db.car.findMany({
    where: {
      id: { not: car.id },
      ...FOR_SALE,
      published: true,
      status: { not: "SOLD" },
      OR: [{ bodyType: car.bodyType }, { price: { gte: Math.round(car.price * 0.7), lte: Math.round(car.price * 1.3) } }],
    },
    take,
    orderBy: { createdAt: "desc" },
    select: carCardSelect,
  });
}

export async function getAllCarSlugs(listingType: "SALE" | "RENT" = "SALE") {
  return db.car.findMany({ where: { listingType, published: true }, select: { slug: true, updatedAt: true } });
}

// ───────────── Rentals ─────────────

/** Published rental cars: available first, then the rest (currently rented). */
export async function getRentalCars(take?: number) {
  const cars = await db.car.findMany({
    where: { listingType: "RENT", published: true, status: { not: "SOLD" } },
    orderBy: [{ featured: "desc" }, { price: "asc" }],
    take,
    select: carCardSelect,
  });
  return cars.sort((a, b) => Number(b.status === "AVAILABLE") - Number(a.status === "AVAILABLE"));
}

export async function getRentalCarBySlug(slug: string, locale: Locale) {
  const car = await getCarBySlug(slug, locale);
  return car?.listingType === "RENT" ? car : null;
}
