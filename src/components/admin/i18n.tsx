"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { AdminT } from "@/i18n/admin";

const Ctx = createContext<{ t: AdminT; locale: Locale } | null>(null);

export function AdminI18nProvider({ t, locale, children }: { t: AdminT; locale: Locale; children: ReactNode }) {
  return <Ctx.Provider value={{ t, locale }}>{children}</Ctx.Provider>;
}

/** Admin interface text in the language chosen in the sidebar switcher. */
export function useAdminT() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdminT must be used inside AdminI18nProvider");
  return v;
}
