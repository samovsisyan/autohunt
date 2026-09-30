import { intlLocales, type Locale } from "./config";

/** Replace {placeholders} in a dictionary string. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}

/**
 * Deterministic number grouping (identical on server and in every browser, so no hydration drift
 * from differing ICU data): "21,929" in English, "21 929" (no-break space) in Armenian and Russian.
 */
function group(value: number, locale: Locale): string {
  const n = Math.round(Math.abs(value));
  const sep = locale === "en" ? "," : "\u00A0";
  const s = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  return value < 0 ? `−${s}` : s;
}

export function formatUsd(value: number, locale: Locale = "en"): string {
  return `$${group(value, locale)}`;
}

export function formatAmd(value: number, locale: Locale = "en"): string {
  return `${group(Math.round(value / 1000) * 1000, locale)}\u00A0֏`;
}

export function formatNumber(value: number, locale: Locale = "en"): string {
  return group(value, locale);
}

export function formatDate(value: Date | string, locale: Locale, opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(intlLocales[locale], opts ?? { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(value),
  );
}
