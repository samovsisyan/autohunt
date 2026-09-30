import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "@/server/db";
import { computeEstimate, type CalculatorConfig, type EstimateInput, type EstimateResult } from "./engine";
import { loadCalculatorConfig, loadCalculatorOptions } from "./calculator.repository";
import type { Locale } from "@/i18n/config";

// Short-lived in-process cache; admin mutations call invalidateCalculatorCache().
let cached: { at: number; config: CalculatorConfig } | null = null;
const TTL_MS = 60_000;

async function getConfig(): Promise<CalculatorConfig> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.config;
  const config = await loadCalculatorConfig();
  cached = { at: Date.now(), config };
  return config;
}

export function invalidateCalculatorCache() {
  cached = null;
}

export async function estimate(input: EstimateInput): Promise<EstimateResult> {
  return computeEstimate(input, await getConfig());
}

export type CalculatorOptions = Awaited<ReturnType<typeof getCalculatorOptions>>;

export async function getCalculatorOptions(locale: Locale) {
  const o = await loadCalculatorOptions();
  const pick = (n: Record<string, string | undefined>) => n[locale] ?? n.en ?? "";
  const currentYear = new Date().getFullYear();
  return {
    auctions: o.auctions.map((a) => ({ value: a.code, label: a.name })),
    origins: o.origins.map((x) => ({ value: x.code, label: pick(x.name) })),
    destinations: o.destinations.map((x) => ({ value: x.code, label: pick(x.name) })),
    vehicleTypes: o.vehicleTypes.map((x) => ({ value: x.code, label: pick(x.name) })),
    years: Array.from({ length: 20 }, (_, i) => currentYear + 1 - i),
    amdRate: o.amdRate,
  };
}

export async function saveCalculation(input: EstimateInput, userId: string | null, label?: string) {
  const result = await estimate(input);
  const shareId = randomBytes(6).toString("base64url");
  return db.calculation.create({
    data: { shareId, userId, label, input: input as object, result: result as object },
    select: { shareId: true, id: true },
  });
}

export async function getCalculationByShareId(shareId: string) {
  return db.calculation.findUnique({ where: { shareId } });
}
