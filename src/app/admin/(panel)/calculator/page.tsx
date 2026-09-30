import { db } from "@/server/db";
import { AdminHeader } from "@/components/admin/ui";
import { CalculatorSettings, type CalculatorSettingsData } from "@/components/admin/calculator-settings";

export const metadata = { title: "Calculator settings" };

type Names = { hy: string; ru: string; en: string };
const names = (n: unknown): Names => ({ hy: "", ru: "", en: "", ...(n as Partial<Names>) });

export default async function CalculatorSettingsPage() {
  const [rates, setting, auctions, origins, destinations, vehicleTypes, shipping, customs, fees] = await Promise.all([
    db.exchangeRate.findMany({ orderBy: { code: "asc" } }),
    db.setting.findUnique({ where: { key: "calculator" } }),
    db.auction.findMany({ orderBy: { sortOrder: "asc" }, include: { feeTiers: { orderBy: { minPrice: "asc" } } } }),
    db.originCountry.findMany({ orderBy: { sortOrder: "asc" } }),
    db.destination.findMany({ orderBy: { sortOrder: "asc" } }),
    db.vehicleType.findMany({ orderBy: { sortOrder: "asc" } }),
    db.shippingRate.findMany(),
    db.customsRule.findMany({ orderBy: { priority: "asc" } }),
    db.feeRule.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  const s = (setting?.value ?? {}) as { customsBaseIncludesShipping?: boolean; referenceYear?: number | null };

  const data: CalculatorSettingsData = {
    rates: rates.map((r) => ({ code: r.code, perUsd: r.perUsd })),
    settings: { customsBaseIncludesShipping: s.customsBaseIncludesShipping ?? true, referenceYear: s.referenceYear ?? null },
    auctions: auctions.map((a) => ({
      id: a.id,
      code: a.code,
      name: a.name,
      active: a.active,
      sortOrder: a.sortOrder,
      tiers: a.feeTiers.map((t) => ({ minPrice: t.minPrice, maxPrice: t.maxPrice, fixedFee: t.fixedFee, percentFee: t.percentFee })),
    })),
    origins: origins.map((o) => ({ id: o.id, code: o.code, name: names(o.name), active: o.active, sortOrder: o.sortOrder })),
    destinations: destinations.map((o) => ({ id: o.id, code: o.code, name: names(o.name), active: o.active, sortOrder: o.sortOrder })),
    vehicleTypes: vehicleTypes.map((o) => ({ id: o.id, code: o.code, name: names(o.name), active: true, sortOrder: o.sortOrder })),
    shipping: shipping.map((r) => ({ originId: r.originId, destinationId: r.destinationId, vehicleTypeId: r.vehicleTypeId, inlandTransport: r.inlandTransport, oceanShipping: r.oceanShipping, landDelivery: r.landDelivery })),
    customs: customs.map((c) => ({ ...c, fuelTypes: c.fuelTypes as string[] })),
    fees: fees.map((f) => ({ ...f, name: names(f.name) })),
  };

  return (
    <>
      <AdminHeader
        title="Calculator settings"
        description="Every number behind the public cost calculator. Nothing is hardcoded in the frontend — saving here updates estimates on the website immediately."
      />
      <CalculatorSettings data={data} />
    </>
  );
}
