import { AdminHeader } from "@/components/admin/ui";
import { CarEditor, emptyCar } from "@/components/admin/car-editor";
import { adminTitle, getAdminT } from "@/i18n/admin";

export const generateMetadata = adminTitle((t) => t.cars.add);

export default async function NewCarPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const [{ t }, { type }] = await Promise.all([getAdminT(), searchParams]);
  const rent = type === "RENT";
  return (
    <>
      <AdminHeader title={rent ? t.cars.addRental : t.cars.add} back={{ href: rent ? "/admin/cars?status=RENT" : "/admin/cars", label: t.cars.title }} />
      <CarEditor initial={emptyCar} rental={rent} />
    </>
  );
}
