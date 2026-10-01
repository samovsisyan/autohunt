import "server-only";
import { db } from "@/server/db";
import { getAdminLocale } from "@/i18n/admin";

export async function importEditorLookups() {
  const [customers, cars, auctions, destinations, vehicleTypes, locale] = await Promise.all([
    db.user.findMany({ where: { role: { in: ["CUSTOMER", "CORPORATE"] } }, orderBy: { name: "asc" }, select: { id: true, name: true, email: true } }),
    db.car.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, year: true, brand: true, model: true } }),
    db.auction.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, code: true, name: true } }),
    db.destination.findMany({ orderBy: { sortOrder: "asc" } }),
    db.vehicleType.findMany({ orderBy: { sortOrder: "asc" } }),
    getAdminLocale(),
  ]);
  const name = (n: unknown) => {
    const names = (n ?? {}) as Partial<Record<typeof locale, string>>;
    return names[locale] || names.en || "";
  };
  return {
    customers,
    cars: cars.map((c) => ({ id: c.id, title: `${c.year} ${c.brand} ${c.model}` })),
    auctions,
    destinations: destinations.map((d) => ({ value: d.code, label: name(d.name) })),
    vehicleTypes: vehicleTypes.map((v) => ({ value: v.code, label: name(v.name) })),
  };
}
