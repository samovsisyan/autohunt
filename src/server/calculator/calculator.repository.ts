import "server-only";
import { db } from "@/server/db";
import type { CalculatorConfig, FuelType } from "./engine";

export type LocalizedName = Partial<Record<"hy" | "ru" | "en", string>>;

export async function loadCalculatorConfig(): Promise<CalculatorConfig> {
  const [auctions, shipping, customs, fees, rates, setting] = await Promise.all([
    db.auction.findMany({ where: { active: true }, include: { feeTiers: { orderBy: { minPrice: "asc" } } } }),
    db.shippingRate.findMany({
      include: { origin: true, destination: true, vehicleType: true },
      where: { origin: { active: true }, destination: { active: true } },
    }),
    db.customsRule.findMany({ where: { active: true }, orderBy: { priority: "asc" } }),
    db.feeRule.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    db.exchangeRate.findMany(),
    db.setting.findUnique({ where: { key: "calculator" } }),
  ]);

  const settings = (setting?.value ?? {}) as { customsBaseIncludesShipping?: boolean; referenceYear?: number | null };
  const latestRate = rates.reduce<Date | null>((d, r) => (!d || r.updatedAt > d ? r.updatedAt : d), null);

  return {
    auctions: Object.fromEntries(
      auctions.map((a) => [
        a.code,
        a.feeTiers.map((t) => ({ minPrice: t.minPrice, maxPrice: t.maxPrice, fixedFee: t.fixedFee, percentFee: t.percentFee })),
      ]),
    ),
    shipping: shipping.map((s) => ({
      origin: s.origin.code,
      destination: s.destination.code,
      vehicleType: s.vehicleType.code,
      inlandTransport: s.inlandTransport,
      oceanShipping: s.oceanShipping,
      landDelivery: s.landDelivery,
    })),
    customs: customs.map((c) => ({
      id: c.id,
      name: c.name,
      fuelTypes: c.fuelTypes as FuelType[],
      minAge: c.minAge,
      maxAge: c.maxAge,
      minEngineCc: c.minEngineCc,
      maxEngineCc: c.maxEngineCc,
      dutyPercent: c.dutyPercent,
      dutyPerCcEur: c.dutyPerCcEur,
      exciseFixed: c.exciseFixed,
      vatPercent: c.vatPercent,
      processingFee: c.processingFee,
      priority: c.priority,
    })),
    fees: fees.map((f) => ({
      key: f.key,
      category: f.category,
      type: f.type,
      basis: f.basis,
      amount: f.amount,
      minAmount: f.minAmount,
      maxAmount: f.maxAmount,
      sortOrder: f.sortOrder,
    })),
    rates: Object.fromEntries(rates.map((r) => [r.code, r.perUsd])),
    customsBaseIncludesShipping: settings.customsBaseIncludesShipping ?? true,
    referenceYear: settings.referenceYear || new Date().getFullYear(),
    ratesUpdatedAt: (latestRate ?? new Date()).toISOString(),
  };
}

export async function loadCalculatorOptions() {
  const [auctions, origins, destinations, vehicleTypes, amd] = await Promise.all([
    db.auction.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, select: { code: true, name: true } }),
    db.originCountry.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, select: { code: true, name: true } }),
    db.destination.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, select: { code: true, name: true } }),
    db.vehicleType.findMany({ orderBy: { sortOrder: "asc" }, select: { code: true, name: true } }),
    db.exchangeRate.findUnique({ where: { code: "AMD" } }),
  ]);
  return {
    auctions,
    origins: origins.map((o) => ({ code: o.code, name: o.name as LocalizedName })),
    destinations: destinations.map((d) => ({ code: d.code, name: d.name as LocalizedName })),
    vehicleTypes: vehicleTypes.map((v) => ({ code: v.code, name: v.name as LocalizedName })),
    amdRate: amd?.perUsd ?? null,
  };
}
