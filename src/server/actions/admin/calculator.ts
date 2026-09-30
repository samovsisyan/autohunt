"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { invalidateCalculatorCache } from "@/server/calculator/calculator.service";
import { adminAction, revalidatePublic } from "./_utils";

const fuel = z.enum(["GASOLINE", "DIESEL", "HYBRID", "PLUGIN_HYBRID", "ELECTRIC"]);
const money = z.coerce.number().min(0).max(10_000_000);
const optInt = z.union([z.coerce.number().int().min(0), z.null()]);
const names = z.object({ hy: z.string().trim().max(80), ru: z.string().trim().max(80), en: z.string().trim().min(1).max(80) });
const code = z.string().trim().min(1).max(20).regex(/^[A-Z0-9_]+$/, "UPPERCASE letters, digits, underscore");

function done() {
  invalidateCalculatorCache();
  revalidatePublic();
}

export async function saveRatesAction(input: { rates: { code: string; perUsd: number }[]; customsBaseIncludesShipping: boolean; referenceYear: number | null }) {
  return adminAction(async () => {
    const d = z
      .object({
        rates: z.array(z.object({ code: z.string().trim().min(3).max(3).toUpperCase(), perUsd: z.coerce.number().positive() })).max(20),
        customsBaseIncludesShipping: z.boolean(),
        referenceYear: z.union([z.coerce.number().int().min(2000).max(2100), z.null()]),
      })
      .parse(input);
    await db.$transaction([
      ...d.rates.map((r) => db.exchangeRate.upsert({ where: { code: r.code }, create: r, update: { perUsd: r.perUsd } })),
      db.exchangeRate.deleteMany({ where: { code: { notIn: d.rates.map((r) => r.code) } } }),
      db.setting.upsert({
        where: { key: "calculator" },
        create: { key: "calculator", value: { customsBaseIncludesShipping: d.customsBaseIncludesShipping, referenceYear: d.referenceYear } },
        update: { value: { customsBaseIncludesShipping: d.customsBaseIncludesShipping, referenceYear: d.referenceYear } },
      }),
    ]);
    done();
  });
}

const auctionSchema = z.object({
  id: z.string().optional(),
  code,
  name: z.string().trim().min(1).max(60),
  active: z.boolean(),
  sortOrder: z.coerce.number().int(),
  tiers: z
    .array(z.object({ minPrice: z.coerce.number().int().min(0), maxPrice: optInt, fixedFee: money, percentFee: z.coerce.number().min(0).max(100) }))
    .min(1, "At least one fee tier"),
});

export async function saveAuctionAction(input: z.input<typeof auctionSchema>) {
  return adminAction(async () => {
    const d = auctionSchema.parse(input);
    const tiers = [...d.tiers].sort((a, b) => a.minPrice - b.minPrice);
    await db.$transaction(async (tx) => {
      const a = d.id
        ? await tx.auction.update({ where: { id: d.id }, data: { code: d.code, name: d.name, active: d.active, sortOrder: d.sortOrder } })
        : await tx.auction.create({ data: { code: d.code, name: d.name, active: d.active, sortOrder: d.sortOrder } });
      await tx.auctionFeeTier.deleteMany({ where: { auctionId: a.id } });
      await tx.auctionFeeTier.createMany({ data: tiers.map((t) => ({ ...t, auctionId: a.id })) });
    });
    done();
  });
}

export async function deleteAuctionAction(id: string) {
  return adminAction(async () => {
    await db.auction.delete({ where: { id } });
    done();
  });
}

const lookupKinds = { origin: "originCountry", destination: "destination", vehicleType: "vehicleType" } as const;
const lookupSchema = z.object({ id: z.string().optional(), code, name: names, active: z.boolean().default(true), sortOrder: z.coerce.number().int() });

export async function saveLookupAction(kind: keyof typeof lookupKinds, input: z.input<typeof lookupSchema>) {
  return adminAction(async () => {
    const d = lookupSchema.parse(input);
    const k = z.enum(["origin", "destination", "vehicleType"]).parse(kind);
    const data = k === "vehicleType" ? { code: d.code, name: d.name, sortOrder: d.sortOrder } : { code: d.code, name: d.name, sortOrder: d.sortOrder, active: d.active };
    // Dynamic delegate access keeps one action for all three lookup tables.
    const delegate = db[lookupKinds[k]] as unknown as { update: (a: object) => Promise<unknown>; create: (a: object) => Promise<unknown> };
    if (d.id) await delegate.update({ where: { id: d.id }, data });
    else await delegate.create({ data });
    done();
  });
}

export async function deleteLookupAction(kind: keyof typeof lookupKinds, id: string) {
  return adminAction(async () => {
    const k = z.enum(["origin", "destination", "vehicleType"]).parse(kind);
    const delegate = db[lookupKinds[k]] as unknown as { delete: (a: object) => Promise<unknown> };
    await delegate.delete({ where: { id } });
    done();
  });
}

export async function saveShippingRatesAction(rows: { originId: string; destinationId: string; vehicleTypeId: string; inlandTransport: number; oceanShipping: number; landDelivery: number }[]) {
  return adminAction(async () => {
    const d = z
      .array(z.object({ originId: z.string(), destinationId: z.string(), vehicleTypeId: z.string(), inlandTransport: money, oceanShipping: money, landDelivery: money }))
      .max(500)
      .parse(rows);
    await db.$transaction(
      d.map((r) =>
        db.shippingRate.upsert({
          where: { originId_destinationId_vehicleTypeId: { originId: r.originId, destinationId: r.destinationId, vehicleTypeId: r.vehicleTypeId } },
          create: { ...r, inlandTransport: Math.round(r.inlandTransport), oceanShipping: Math.round(r.oceanShipping), landDelivery: Math.round(r.landDelivery) },
          update: { inlandTransport: Math.round(r.inlandTransport), oceanShipping: Math.round(r.oceanShipping), landDelivery: Math.round(r.landDelivery) },
        }),
      ),
    );
    done();
  });
}

const customsSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(120),
  fuelTypes: z.array(fuel),
  minAge: z.coerce.number().int().min(0),
  maxAge: optInt,
  minEngineCc: z.coerce.number().int().min(0),
  maxEngineCc: optInt,
  dutyPercent: z.coerce.number().min(0).max(200),
  dutyPerCcEur: z.coerce.number().min(0).max(100),
  exciseFixed: money,
  vatPercent: z.coerce.number().min(0).max(100),
  processingFee: money,
  priority: z.coerce.number().int(),
  active: z.boolean(),
  notes: z.string().max(1000).nullable().optional(),
});

export async function saveCustomsRuleAction(input: z.input<typeof customsSchema>) {
  return adminAction(async () => {
    const { id, ...data } = customsSchema.parse(input);
    if (id) await db.customsRule.update({ where: { id }, data });
    else await db.customsRule.create({ data });
    done();
  });
}

export async function deleteCustomsRuleAction(id: string) {
  return adminAction(async () => {
    await db.customsRule.delete({ where: { id } });
    done();
  });
}

const feeSchema = z.object({
  id: z.string().optional(),
  key: z.string().trim().min(2).max(40).regex(/^[a-z0-9_]+$/),
  name: names,
  category: z.enum(["DOCUMENTATION", "REGISTRATION", "SERVICE"]),
  type: z.enum(["FIXED", "PERCENT"]),
  basis: z.enum(["CAR_PRICE", "SUBTOTAL"]),
  amount: z.coerce.number().min(0),
  minAmount: z.union([z.coerce.number().min(0), z.null()]),
  maxAmount: z.union([z.coerce.number().min(0), z.null()]),
  active: z.boolean(),
  sortOrder: z.coerce.number().int(),
});

export async function saveFeeRuleAction(input: z.input<typeof feeSchema>) {
  return adminAction(async () => {
    const { id, ...data } = feeSchema.parse(input);
    if (id) await db.feeRule.update({ where: { id }, data });
    else await db.feeRule.create({ data });
    done();
  });
}

export async function deleteFeeRuleAction(id: string) {
  return adminAction(async () => {
    await db.feeRule.delete({ where: { id } });
    done();
  });
}
