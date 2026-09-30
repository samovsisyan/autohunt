import { z } from "zod";

export const fuelTypes = ["GASOLINE", "DIESEL", "HYBRID", "PLUGIN_HYBRID", "ELECTRIC"] as const;

export const estimateInputSchema = z.object({
  auction: z.string().min(1).max(20),
  price: z.coerce.number().min(0).max(2_000_000),
  year: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1),
  engine: z.coerce.number().min(0).max(10),
  fuel: z.enum(fuelTypes),
  vehicleType: z.string().min(1).max(20),
  origin: z.string().min(1).max(10),
  destination: z.string().min(1).max(20),
});

export const saveCalculationSchema = z.object({
  input: estimateInputSchema,
  label: z.string().max(120).optional(),
});
