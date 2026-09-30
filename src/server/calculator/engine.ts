/**
 * Pure import-cost engine. It knows the *shape* of the rules, never the numbers:
 * every rate, tier, percentage and threshold is passed in from the database
 * (see calculator.repository.ts) and edited from /admin/calculator.
 *
 * Pipeline: Vehicle → Country → Year → Engine → Fuel → Customs rule → Shipping rule → Fees → Estimate
 */

export type FuelType = "GASOLINE" | "DIESEL" | "HYBRID" | "PLUGIN_HYBRID" | "ELECTRIC";

export interface EstimateInput {
  auction: string; // Auction.code
  price: number; // USD
  year: number;
  engine: number; // liters (0 for EV)
  fuel: FuelType;
  vehicleType: string; // VehicleType.code
  origin: string; // OriginCountry.code
  destination: string; // Destination.code
}

export interface FeeTierConfig {
  minPrice: number;
  maxPrice: number | null;
  fixedFee: number;
  percentFee: number;
}

export interface ShippingRateConfig {
  origin: string;
  destination: string;
  vehicleType: string;
  inlandTransport: number;
  oceanShipping: number;
  landDelivery: number;
}

export interface CustomsRuleConfig {
  id: string;
  name: string;
  fuelTypes: FuelType[];
  minAge: number;
  maxAge: number | null;
  minEngineCc: number;
  maxEngineCc: number | null;
  dutyPercent: number;
  dutyPerCcEur: number;
  exciseFixed: number;
  vatPercent: number;
  processingFee: number;
  priority: number;
}

export interface FeeRuleConfig {
  key: string;
  category: "DOCUMENTATION" | "REGISTRATION" | "SERVICE";
  type: "FIXED" | "PERCENT";
  basis: "CAR_PRICE" | "SUBTOTAL";
  amount: number;
  minAmount: number | null;
  maxAmount: number | null;
  sortOrder: number;
}

export interface CalculatorConfig {
  auctions: Record<string, FeeTierConfig[]>;
  shipping: ShippingRateConfig[];
  customs: CustomsRuleConfig[];
  fees: FeeRuleConfig[];
  rates: Record<string, number>; // units per 1 USD (AMD, EUR, …)
  customsBaseIncludesShipping: boolean;
  referenceYear: number;
  ratesUpdatedAt: string;
}

export type LineKey =
  | "carPrice"
  | "auctionFees"
  | "inlandTransport"
  | "shipping"
  | "customs"
  | "documentation"
  | "registration"
  | "service";

export interface EstimateLine {
  key: LineKey;
  amount: number;
  detail?: { key: string; amount: number }[];
}

export interface EstimateResult {
  isEstimate: true;
  input: EstimateInput;
  lines: EstimateLine[];
  total: number;
  totalAmd: number | null;
  amdRate: number | null;
  markupPercent: number;
  vehicleAge: number;
  customsRule: string | null;
  ratesUpdatedAt: string;
  warnings: string[];
}

export class EstimateError extends Error {
  constructor(
    public code: "UNKNOWN_AUCTION" | "NO_SHIPPING_RATE" | "NO_CUSTOMS_RULE" | "NO_EUR_RATE",
    message: string,
  ) {
    super(message);
  }
}

const round = (n: number) => Math.round(n);

export function auctionFee(price: number, tiers: FeeTierConfig[]): number {
  const tier = tiers.find((t) => price >= t.minPrice && (t.maxPrice === null || price <= t.maxPrice));
  if (!tier) return 0;
  return tier.fixedFee + (price * tier.percentFee) / 100;
}

export function matchCustomsRule(
  rules: CustomsRuleConfig[],
  fuel: FuelType,
  age: number,
  engineCc: number,
): CustomsRuleConfig | undefined {
  return [...rules]
    .sort((a, b) => a.priority - b.priority)
    .find(
      (r) =>
        (r.fuelTypes.length === 0 || r.fuelTypes.includes(fuel)) &&
        age >= r.minAge &&
        (r.maxAge === null || age <= r.maxAge) &&
        engineCc >= r.minEngineCc &&
        (r.maxEngineCc === null || engineCc <= r.maxEngineCc),
    );
}

function applyFee(rule: FeeRuleConfig, carPrice: number, subtotal: number): number {
  let value = rule.type === "FIXED" ? rule.amount : ((rule.basis === "CAR_PRICE" ? carPrice : subtotal) * rule.amount) / 100;
  if (rule.minAmount !== null) value = Math.max(value, rule.minAmount);
  if (rule.maxAmount !== null) value = Math.min(value, rule.maxAmount);
  return value;
}

export function computeEstimate(input: EstimateInput, config: CalculatorConfig): EstimateResult {
  const warnings: string[] = [];
  const price = Math.max(0, input.price);

  // 1. Auction fees
  const tiers = config.auctions[input.auction];
  if (!tiers) throw new EstimateError("UNKNOWN_AUCTION", `Unknown auction ${input.auction}`);
  const fees = auctionFee(price, tiers);

  // 2. Shipping rule (origin → destination, per vehicle type)
  const route = config.shipping.find(
    (s) => s.origin === input.origin && s.destination === input.destination && s.vehicleType === input.vehicleType,
  );
  if (!route) throw new EstimateError("NO_SHIPPING_RATE", "No shipping rate for this route and vehicle type");
  const inland = route.inlandTransport;
  const shipping = route.oceanShipping + route.landDelivery;

  // 3. Customs rule (fuel, age, engine)
  const age = Math.max(0, config.referenceYear - input.year);
  const engineCc = input.fuel === "ELECTRIC" ? 0 : Math.round(input.engine * 1000);
  const rule = matchCustomsRule(config.customs, input.fuel, age, engineCc);
  if (!rule) throw new EstimateError("NO_CUSTOMS_RULE", "No customs rule matches this vehicle");

  const eurPerUsd = config.rates.EUR;
  if (rule.dutyPerCcEur > 0 && !eurPerUsd) throw new EstimateError("NO_EUR_RATE", "EUR exchange rate missing");
  const usdPerEur = eurPerUsd ? 1 / eurPerUsd : 0;

  const customsValue = price + fees + (config.customsBaseIncludesShipping ? inland + route.oceanShipping : 0);
  const dutyByValue = (customsValue * rule.dutyPercent) / 100;
  const dutyByVolume = engineCc * rule.dutyPerCcEur * usdPerEur;
  const duty = Math.max(dutyByValue, dutyByVolume);
  const excise = rule.exciseFixed;
  const vat = ((customsValue + duty + excise) * rule.vatPercent) / 100;
  const processing = rule.processingFee;
  const customs = duty + excise + vat + processing;

  // 4. Configurable fees (documentation, registration, service)
  const subtotal = price + fees + inland + shipping + customs;
  const byCategory = { DOCUMENTATION: 0, REGISTRATION: 0, SERVICE: 0 };
  for (const f of [...config.fees].sort((a, b) => a.sortOrder - b.sortOrder)) {
    byCategory[f.category] += applyFee(f, price, subtotal);
  }

  const lines: EstimateLine[] = [
    { key: "carPrice", amount: round(price) },
    { key: "auctionFees", amount: round(fees) },
    { key: "inlandTransport", amount: round(inland) },
    { key: "shipping", amount: round(shipping) },
    {
      key: "customs",
      amount: round(customs),
      detail: [
        { key: "duty", amount: round(duty) },
        ...(excise ? [{ key: "excise", amount: round(excise) }] : []),
        { key: "vat", amount: round(vat) },
        ...(processing ? [{ key: "processing", amount: round(processing) }] : []),
      ],
    },
    { key: "documentation", amount: round(byCategory.DOCUMENTATION) },
    { key: "registration", amount: round(byCategory.REGISTRATION) },
    { key: "service", amount: round(byCategory.SERVICE) },
  ];

  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  const amdRate = config.rates.AMD ?? null;
  if (!amdRate) warnings.push("AMD rate missing");

  return {
    isEstimate: true,
    input,
    lines,
    total,
    totalAmd: amdRate ? round(total * amdRate) : null,
    amdRate,
    markupPercent: price > 0 ? Math.round(((total - price) / price) * 100) : 0,
    vehicleAge: age,
    customsRule: rule.name,
    ratesUpdatedAt: config.ratesUpdatedAt,
    warnings,
  };
}
