import "server-only";
import { cache } from "react";
import { db } from "@/server/db";
import type { Locale } from "@/i18n/config";

/**
 * Editable page content (homepage sections, contact info, FAQ…).
 * Each key+locale holds a JSON document; missing fields fall back to the dictionary defaults.
 */
export const getContent = cache(async <T extends object>(key: string, locale: Locale, fallback: T): Promise<T> => {
  const row = await db.siteContent.findUnique({ where: { key_locale: { key, locale } } });
  if (!row) return fallback;
  const data = row.data as Partial<T>;
  const merged = { ...fallback } as Record<string, unknown>;
  for (const [k, v] of Object.entries(data)) {
    if (v !== "" && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0)) merged[k] = v;
  }
  return merged as T;
});

export interface ContactInfo {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  instagram: string;
  facebook: string;
  telegram: string;
}

export const defaultContact: ContactInfo = {
  phone: "+374 00 000 000",
  whatsapp: "+37400000000",
  email: "info@autohunt.am",
  address: "Gyumri, Armenia",
  hours: "Mon–Sat, 10:00–19:00",
  instagram: "",
  facebook: "",
  telegram: "",
};

export const getContact = (locale: Locale) => getContent<ContactInfo>("site.contact", locale, defaultContact);

export interface FaqItem {
  q: string;
  a: string;
}
export const getFaq = (locale: Locale) => getContent<{ items: FaqItem[] }>("home.faq", locale, { items: [] });
