import "server-only";
import { db } from "@/server/db";
import type { RequestInput } from "@/server/validation/request";

/** Persist a lead. Type-specific fields go into `payload`; common contact fields are columns. */
export async function createRequest(input: RequestInput, userId: string | null) {
  const { type, name, phone, email, message, locale, payload: extra, ...rest } = input;
  const carId = "carId" in rest ? rest.carId : undefined;
  const company = "company" in rest ? rest.company : undefined;
  const payload = {
    ...Object.fromEntries(
      Object.entries(rest).filter(([k, v]) => k !== "carId" && k !== "company" && v !== undefined && v !== ""),
    ),
    ...(extra ?? {}),
  };
  if (JSON.stringify(payload).length > 8000) throw new Error("Payload too large");

  if (carId) {
    const exists = await db.car.findUnique({ where: { id: carId }, select: { id: true } });
    if (!exists) throw new Error("Car not found");
  }

  return db.request.create({
    data: {
      type,
      name,
      phone,
      email: email ?? null,
      message: message ?? null,
      company: company ?? null,
      locale,
      carId: carId ?? null,
      userId,
      payload: Object.keys(payload).length ? (payload as object) : undefined,
    },
    select: { id: true },
  });
}
