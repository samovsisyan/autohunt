import "server-only";
import { ZodError } from "zod";
import { db } from "@/server/db";
import type { RequestInput } from "@/server/validation/request";

/** Reported as a 400 VALIDATION_ERROR by the API route, like schema errors. */
const invalid = (field: string, message: string) => new ZodError([{ code: "custom", path: [field], message, input: undefined }]);

/** Whole days between two YYYY-MM-DD dates (UTC, so DST never shifts the count). */
export function rentalDays(pickup: string, ret: string) {
  return Math.round((Date.parse(`${ret}T00:00:00Z`) - Date.parse(`${pickup}T00:00:00Z`)) / 86_400_000);
}

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
    const car = await db.car.findUnique({ where: { id: carId }, select: { listingType: true, price: true, rentMinDays: true } });
    if (!car) throw new Error("Car not found");
    if (type === "RENTAL") {
      if (car.listingType !== "RENT") throw invalid("carId", "Car is not for rent");
      // Price the booking on the server from the car's daily rate; the client estimate is display-only.
      const days = rentalDays(payload.pickup as string, payload.return as string);
      if (days < (car.rentMinDays ?? 1)) throw invalid("return", "Below minimum rental period");
      Object.assign(payload, { days, pricePerDay: car.price, estimatedTotal: days * car.price });
    }
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
