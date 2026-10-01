"use server";

import { cookies } from "next/headers";
import { isLocale } from "@/i18n/config";
import { ADMIN_LOCALE_COOKIE } from "@/i18n/admin";

/** Remember the admin interface language. Not admin-gated: the login page uses it too, and it only sets a preference. */
export async function setAdminLocaleAction(locale: string) {
  if (!isLocale(locale)) return;
  (await cookies()).set(ADMIN_LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}
