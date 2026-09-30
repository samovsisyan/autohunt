"use server";

import { db } from "@/server/db";
import { carAdminSchema, type CarAdminInput } from "@/server/validation/admin";
import { adminAction, revalidatePublic } from "./_utils";

export async function saveCarAction(input: CarAdminInput) {
  return adminAction(async () => {
    const d = carAdminSchema.parse(input);
    const data = {
      slug: d.slug,
      brand: d.brand,
      model: d.model,
      trim: d.trim,
      year: d.year,
      mileage: d.mileage,
      mileageUnit: d.mileageUnit,
      engineVolume: d.engineVolume,
      horsepower: d.horsepower,
      fuel: d.fuel,
      transmission: d.transmission,
      drive: d.drive,
      bodyType: d.bodyType,
      color: d.color,
      interior: d.interior,
      vin: d.vin,
      price: d.price,
      location: d.location,
      source: d.source,
      status: d.status,
      published: d.published,
      featured: d.featured,
      features: d.features,
      history: d.history,
    };
    const id = await db.$transaction(async (tx) => {
      const existing = d.id ? await tx.car.findUnique({ where: { id: d.id }, select: { status: true, soldAt: true } }) : null;
      const soldAt = d.status === "SOLD" ? (existing?.soldAt ?? new Date()) : null;
      const car = d.id ? await tx.car.update({ where: { id: d.id }, data: { ...data, soldAt } }) : await tx.car.create({ data: { ...data, soldAt } });
      await tx.carImage.deleteMany({ where: { carId: car.id } });
      await tx.carDocument.deleteMany({ where: { carId: car.id } });
      await tx.carTranslation.deleteMany({ where: { carId: car.id } });
      if (d.images.length) await tx.carImage.createMany({ data: d.images.map((img, i) => ({ carId: car.id, url: img.url, alt: img.alt, sortOrder: i })) });
      if (d.documents.length) await tx.carDocument.createMany({ data: d.documents.map((doc) => ({ ...doc, carId: car.id })) });
      await tx.carTranslation.createMany({
        data: (["hy", "ru", "en"] as const).map((locale) => ({ carId: car.id, locale, ...d.translations[locale] })),
      });
      return car.id;
    });
    revalidatePublic();
    return { id };
  });
}

export async function setCarFlagsAction(id: string, patch: { published?: boolean; status?: "AVAILABLE" | "SOLD" | "RESERVED" | "IN_TRANSIT"; featured?: boolean }) {
  return adminAction(async () => {
    await db.car.update({
      where: { id },
      data: { ...patch, ...(patch.status ? { soldAt: patch.status === "SOLD" ? new Date() : null } : {}) },
    });
    revalidatePublic();
  });
}

export async function deleteCarAction(id: string) {
  return adminAction(async () => {
    await db.car.delete({ where: { id } });
    revalidatePublic();
  });
}
