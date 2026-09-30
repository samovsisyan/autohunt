import "server-only";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { requireAdmin } from "@/server/auth/session";

export type ActionResult<T = unknown> = { ok: true; data?: T } | { ok: false; error: string; fields?: Record<string, string[] | undefined> };

/** Every admin mutation goes through here: role check → handler → error mapping. */
export async function adminAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  await requireAdmin();
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (e) {
    if (e instanceof ZodError) return { ok: false, error: "Validation failed", fields: e.flatten().fieldErrors as Record<string, string[]> };
    if (e instanceof Error && "code" in e && (e as { code?: string }).code === "P2002") return { ok: false, error: "A record with this unique value already exists" };
    console.error("[admin]", e);
    return { ok: false, error: e instanceof Error ? e.message : "Unexpected error" };
  }
}

/** Public pages are ISR-cached; flush them after content changes. */
export function revalidatePublic() {
  revalidatePath("/", "layout");
}

export const toNull = (v: FormDataEntryValue | null) => {
  const s = typeof v === "string" ? v.trim() : "";
  return s === "" ? null : s;
};
