import { z } from "zod";

const optStr = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));
const optNum = z
  .union([z.number(), z.string()])
  .optional()
  .nullable()
  .transform((v) => (v === "" || v === null || v === undefined ? null : Number(v)))
  .refine((v) => v === null || Number.isFinite(v), "Must be a number");
const locales = ["hy", "ru", "en"] as const;

const translation = z.object({
  description: z.string().max(20000).default(""),
  seoTitle: optStr(160),
  seoDescription: optStr(320),
});

export const carAdminSchema = z.object({
  id: z.string().optional(),
  slug: z.string().trim().min(3).max(120).regex(/^[a-z0-9-]+$/, "lowercase letters, digits and dashes only"),
  brand: z.string().trim().min(1).max(60),
  model: z.string().trim().min(1).max(60),
  trim: optStr(60),
  year: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1),
  mileage: z.coerce.number().int().min(0).max(2_000_000),
  mileageUnit: z.enum(["MI", "KM"]),
  engineVolume: optNum,
  horsepower: optNum,
  fuel: z.enum(["GASOLINE", "DIESEL", "HYBRID", "PLUGIN_HYBRID", "ELECTRIC"]),
  transmission: z.enum(["AUTOMATIC", "MANUAL", "CVT", "ROBOTIC"]),
  drive: z.enum(["FWD", "RWD", "AWD", "FOUR_WD"]),
  bodyType: z.enum(["SEDAN", "SUV", "CROSSOVER", "HATCHBACK", "COUPE", "WAGON", "PICKUP", "MINIVAN", "CONVERTIBLE"]),
  color: optStr(60),
  interior: optStr(80),
  vin: optStr(20),
  listingType: z.enum(["SALE", "RENT"]).default("SALE"),
  price: z.coerce.number().int().min(0).max(5_000_000),
  rentDeposit: optNum,
  rentMinDays: optNum.refine((v) => v === null || (Number.isInteger(v) && v >= 1 && v <= 365), "1–365 days"),
  location: z.string().trim().min(1).max(60),
  source: optStr(40),
  status: z.enum(["AVAILABLE", "RESERVED", "IN_TRANSIT", "SOLD"]),
  published: z.boolean(),
  featured: z.boolean(),
  features: z.array(z.string().trim().min(1).max(120)).max(60),
  history: z.object({
    owners: optNum,
    accidents: optNum,
    serviceRecords: optNum,
    titleStatus: optStr(80),
    lotNumber: optStr(40),
  }),
  images: z.array(z.object({ url: z.string().min(1).max(1000), alt: optStr(200) })).max(40),
  documents: z.array(z.object({ title: z.string().trim().min(1).max(160), url: z.string().min(1).max(1000), type: z.enum(["INVOICE", "BILL_OF_SALE", "TITLE", "BILL_OF_LADING", "CUSTOMS", "REGISTRATION", "INSPECTION", "VEHICLE_HISTORY", "AUCTION_SHEET", "OTHER"]) })).max(30),
  translations: z.object(Object.fromEntries(locales.map((l) => [l, translation])) as Record<(typeof locales)[number], typeof translation>),
});
export type CarAdminInput = z.input<typeof carAdminSchema>;

const stageEnum = z.enum(["AUCTION", "PURCHASED", "PICKED_UP", "AT_PORT", "SHIPPING", "ARRIVED", "CUSTOMS", "REGISTRATION", "READY"]);
export const importAdminSchema = z.object({
  id: z.string().optional(),
  code: z.string().trim().min(3).max(40),
  customerId: z.string().min(1),
  carId: optStr(40),
  vehicleTitle: z.string().trim().min(2).max(120),
  vehicleYear: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1),
  imageUrl: optStr(1000),
  vin: optStr(20),
  lotNumber: optStr(40),
  auctionId: optStr(40),
  purchasePrice: z.coerce.number().int().min(0),
  estimatedTotal: z.coerce.number().int().min(0),
  finalTotal: optNum,
  paidAmount: z.coerce.number().int().min(0),
  currentStage: stageEnum,
  notes: optStr(4000),
  notifyCustomer: z.boolean().default(true),
  breakdown: z.record(z.string(), z.unknown()).nullable().optional(),
  events: z.array(
    z.object({
      stage: stageEnum,
      status: z.enum(["DONE", "CURRENT", "PENDING"]),
      date: optStr(30),
      location: optStr(200),
      note: optStr(1000),
    }),
  ),
});
export type ImportAdminInput = z.input<typeof importAdminSchema>;

const postTranslation = z.object({
  slug: z.string().trim().min(3).max(160).regex(/^[a-z0-9-]+$/, "lowercase latin letters, digits and dashes only"),
  title: z.string().trim().min(3).max(200),
  excerpt: z.string().trim().min(3).max(500),
  content: z.string().min(1).max(100000),
  seoTitle: optStr(160),
  seoDescription: optStr(320),
});
export const blogAdminSchema = z.object({
  id: z.string().optional(),
  category: z.enum(["CAR_IMPORT", "AUCTIONS", "CUSTOMS", "CAR_BUYING", "MAINTENANCE", "NEWS", "GUIDES"]),
  authorName: z.string().trim().min(2).max(80),
  coverImage: z.string().min(1).max(1000),
  published: z.boolean(),
  publishedAt: z.string().min(8),
  translations: z.object({ hy: postTranslation.optional(), ru: postTranslation.optional(), en: postTranslation.optional() }).refine((t) => t.hy || t.ru || t.en, "At least one language is required"),
});
export type BlogAdminInput = z.input<typeof blogAdminSchema>;

export const seoAdminSchema = z.object({
  id: z.string().optional(),
  path: z.string().trim().regex(/^\/[a-z0-9\-/]*$/i, "Must start with / (locale-less, e.g. /cars)"),
  locale: z.enum(locales),
  title: optStr(160),
  description: optStr(320),
  keywords: optStr(500),
  ogImage: optStr(1000),
  canonical: optStr(1000),
  noindex: z.boolean(),
});
