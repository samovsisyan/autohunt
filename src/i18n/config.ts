export const locales = ["hy", "ru", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "hy";

export const localeLabels: Record<Locale, { short: string; name: string }> = {
  hy: { short: "Հայ", name: "Հայերեն" },
  ru: { short: "Рус", name: "Русский" },
  en: { short: "EN", name: "English" },
};

export const ogLocales: Record<Locale, string> = {
  hy: "hy_AM",
  ru: "ru_RU",
  en: "en_US",
};

export const intlLocales: Record<Locale, string> = {
  hy: "hy-AM",
  ru: "ru-RU",
  en: "en-US",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** Build a locale-prefixed path: href("en", "/cars") → "/en/cars" */
export function href(locale: Locale, path = "/"): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
}
