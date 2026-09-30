import { AdminHeader } from "@/components/admin/ui";
import { CarEditor, emptyCar } from "@/components/admin/car-editor";

export const metadata = { title: "Add car" };

export default function NewCarPage() {
  return (
    <>
      <AdminHeader title="Add car" back={{ href: "/admin/cars", label: "Cars" }} />
      <CarEditor initial={emptyCar} />
    </>
  );
}
