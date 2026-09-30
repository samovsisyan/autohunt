import "server-only";
import { cache } from "react";
import { db } from "@/server/db";
import type { Locale } from "@/i18n/config";

export const getSeoOverride = cache(async (path: string, locale: Locale) => {
  return db.seoEntry.findUnique({ where: { path_locale: { path, locale } } });
});
