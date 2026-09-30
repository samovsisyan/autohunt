"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { requireUser } from "@/server/auth/session";
import { profileSchema } from "@/server/validation/auth";
import { markAllNotificationsRead } from "@/server/services/dashboard.service";

export async function markAllReadAction() {
  const user = await requireUser();
  await markAllNotificationsRead(user.id);
  revalidatePath("/[locale]/dashboard", "layout");
}

export async function updateProfileAction(_prev: { ok: boolean; error?: string } | null, formData: FormData) {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, error: "VALIDATION" };
  await db.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      companyName: parsed.data.companyName || null,
      companyTaxId: parsed.data.companyTaxId || null,
      locale: parsed.data.locale,
    },
  });
  revalidatePath("/[locale]/dashboard", "layout");
  return { ok: true };
}

export async function deleteCalculationAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  // Scoped delete: only the owner's calculation can be removed.
  await db.calculation.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/[locale]/dashboard/calculations", "page");
}
