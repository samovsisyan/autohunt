import "server-only";
import type { EstimateInput } from "./engine";
import { estimateInputSchema } from "@/server/validation/calculator";
import type { CalculatorOptions } from "./calculator.service";

type SP = Record<string, string | string[] | undefined>;

/** Build a calculator input from URL params, falling back field-by-field to sensible defaults. */
export function calculatorInputFromParams(sp: SP, options: CalculatorOptions): EstimateInput {
  const first = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : sp[k]);
  const defaults: EstimateInput = {
    auction: options.auctions[0]?.value ?? "COPART",
    price: 12000,
    year: new Date().getFullYear() - 4,
    engine: 2.5,
    fuel: "GASOLINE",
    vehicleType: options.vehicleTypes[0]?.value ?? "SEDAN",
    origin: options.origins[0]?.value ?? "US",
    destination: options.destinations[0]?.value ?? "GYUMRI",
  };
  const merged: Record<string, unknown> = { ...defaults };
  const shape = estimateInputSchema.shape;
  for (const key of Object.keys(shape) as (keyof typeof shape)[]) {
    const raw = first(key);
    if (raw === undefined) continue;
    const parsed = shape[key].safeParse(raw);
    if (parsed.success) merged[key] = parsed.data;
  }
  const valid = (list: { value: string }[], v: unknown, fb: string) => (list.some((o) => o.value === v) ? (v as string) : fb);
  merged.auction = valid(options.auctions, merged.auction, defaults.auction);
  merged.vehicleType = valid(options.vehicleTypes, merged.vehicleType, defaults.vehicleType);
  merged.origin = valid(options.origins, merged.origin, defaults.origin);
  merged.destination = valid(options.destinations, merged.destination, defaults.destination);
  return merged as unknown as EstimateInput;
}
