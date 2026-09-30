import "server-only";
import type en from "./en";
import type { Locale } from "../config";

export type Dictionary = typeof en;

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  hy: () => import("./hy").then((m) => m.default),
  ru: () => import("./ru").then((m) => m.default),
  en: () => import("./en").then((m) => m.default),
};

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]();
}
