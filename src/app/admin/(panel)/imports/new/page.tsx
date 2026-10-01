import { AdminHeader } from "@/components/admin/ui";
import { ImportEditor } from "@/components/admin/import-editor";
import { importEditorLookups } from "@/server/actions/admin/lookups";
import { db } from "@/server/db";
import { adminTitle, getAdminT } from "@/i18n/admin";

export const generateMetadata = adminTitle((t) => t.imports.create);

export default async function NewImportPage({ searchParams }: { searchParams: Promise<{ customer?: string }> }) {
  const [lookups, count, { customer }, { t }] = await Promise.all([importEditorLookups(), db.import.count(), searchParams, getAdminT()]);
  const year = new Date().getFullYear();
  return (
    <>
      <AdminHeader title={t.imports.create} back={{ href: "/admin/imports", label: t.imports.title }} />
      <ImportEditor
        {...lookups}
        initial={{
          code: `AH-${year}-${String(count + 200).padStart(4, "0")}`,
          customerId: customer ?? "",
          vehicleTitle: "",
          vehicleYear: year - 3,
          purchasePrice: 0,
          estimatedTotal: 0,
          paidAmount: 0,
          currentStage: "AUCTION",
          notifyCustomer: true,
          events: [{ stage: "AUCTION", status: "CURRENT", date: new Date().toISOString().slice(0, 10) }],
        }}
      />
    </>
  );
}
