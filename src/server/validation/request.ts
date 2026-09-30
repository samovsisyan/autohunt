import { z } from "zod";
import { locales } from "@/i18n/config";

const phone = z.string().trim().min(6).max(32).regex(/^[+\d\s()-]+$/);
const optionalText = (max = 2000) => z.string().trim().max(max).optional().or(z.literal("").transform(() => undefined));

const base = {
  name: z.string().trim().min(2).max(120),
  phone,
  email: z.email().max(200).optional().or(z.literal("").transform(() => undefined)),
  message: optionalText(),
  locale: z.enum(locales).default("hy"),
  payload: z.record(z.string(), z.unknown()).optional(),
};

export const requestSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("CAR_REQUEST"), carId: z.string().optional(), ...base }),
  z.object({ type: z.literal("FINANCING"), carId: z.string().optional(), ...base }),
  z.object({ type: z.literal("CONTACT"), carId: z.string().optional(), ...base }),
  z.object({
    type: z.literal("IMPORT"),
    ...base,
    vin: optionalText(40),
    auction: optionalText(20),
    brand: optionalText(60),
    model: optionalText(60),
    year: optionalText(4),
    budget: optionalText(20),
    fuel: optionalText(20),
    mileage: optionalText(20),
  }),
  z.object({
    type: z.literal("CAR_SEARCH"),
    ...base,
    brand: optionalText(60),
    model: optionalText(60),
    year: optionalText(4),
    budget: optionalText(20),
    fuel: optionalText(20),
    mileage: optionalText(20),
  }),
  z.object({
    type: z.literal("CORPORATE"),
    ...base,
    company: z.string().trim().min(2).max(160),
    vehicles: optionalText(10),
    requirements: optionalText(),
    budget: optionalText(20),
  }),
]);

export type RequestInput = z.infer<typeof requestSchema>;
