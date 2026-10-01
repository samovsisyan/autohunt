import "server-only";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "../config";
import { getDictionary } from "../dictionaries";
import type en from "./en";

export type AdminDictionary = typeof en;

/** Admin text plus the shared enum labels (statuses, fuel, stages…) from the site dictionaries. */
export type AdminT = Omit<AdminDictionary, "enums"> & {
  enums: AdminDictionary["enums"] & Awaited<ReturnType<typeof getDictionary>>["enums"] & { blogCategory: Record<string, string> };
};

export const ADMIN_LOCALE_COOKIE = "ah_admin_locale";

const loaders: Record<Locale, () => Promise<AdminDictionary>> = {
  hy: () => import("./hy").then((m) => m.default),
  ru: () => import("./ru").then((m) => m.default),
  en: () => import("./en").then((m) => m.default),
};

export async function getAdminLocale(): Promise<Locale> {
  const value = (await cookies()).get(ADMIN_LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
}

export async function getAdminT(): Promise<{ t: AdminT; locale: Locale }> {
  const locale = await getAdminLocale();
  const [admin, site] = await Promise.all([loaders[locale](), getDictionary(locale)]);
  return { locale, t: { ...admin, enums: { ...site.enums, ...admin.enums, blogCategory: site.blog.categories } } };
}

/** `export const generateMetadata = adminTitle((t) => t.cars.title)` — page title in the admin language. */
export const adminTitle = (pick: (t: AdminT) => string) => async (): Promise<{ title: string }> => ({ title: pick((await getAdminT()).t) });
