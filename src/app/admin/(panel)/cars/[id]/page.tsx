import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { AdminHeader } from "@/components/admin/ui";
import { CarEditor } from "@/components/admin/car-editor";
import type { CarAdminInput } from "@/server/validation/admin";
import { adminTitle, getAdminT } from "@/i18n/admin";

export const generateMetadata = adminTitle((t) => t.cars.edit);

export default async function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await db.car.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } }, documents: true, translations: true },
  });
  if (!car) notFound();
  const { t } = await getAdminT();
  const tr = (l: "hy" | "ru" | "en") => {
    const t = car.translations.find((x) => x.locale === l);
    return { description: t?.description ?? "", seoTitle: t?.seoTitle ?? "", seoDescription: t?.seoDescription ?? "" };
  };
  const h = (car.history ?? {}) as CarAdminInput["history"];
  const initial: CarAdminInput = {
    id: car.id,
    slug: car.slug,
    brand: car.brand,
    model: car.model,
    trim: car.trim,
    year: car.year,
    mileage: car.mileage,
    mileageUnit: car.mileageUnit,
    engineVolume: car.engineVolume,
    horsepower: car.horsepower,
    fuel: car.fuel,
    transmission: car.transmission,
    drive: car.drive,
    bodyType: car.bodyType,
    color: car.color,
    interior: car.interior,
    vin: car.vin,
    listingType: car.listingType,
    price: car.price,
    rentDeposit: car.rentDeposit,
    rentMinDays: car.rentMinDays,
    location: car.location,
    source: car.source,
    status: car.status,
    published: car.published,
    featured: car.featured,
    features: car.features,
    history: { owners: h.owners ?? null, accidents: h.accidents ?? null, serviceRecords: h.serviceRecords ?? null, titleStatus: h.titleStatus ?? "", lotNumber: h.lotNumber ?? "" },
    images: car.images.map((i) => ({ url: i.url, alt: i.alt })),
    documents: car.documents.map((d) => ({ title: d.title, url: d.url, type: d.type })),
    translations: { hy: tr("hy"), ru: tr("ru"), en: tr("en") },
  };
  return (
    <>
      <AdminHeader title={`${car.year} ${car.brand} ${car.model}`} description={car.slug} back={{ href: "/admin/cars", label: t.cars.title }} />
      <CarEditor initial={initial} />
    </>
  );
}
