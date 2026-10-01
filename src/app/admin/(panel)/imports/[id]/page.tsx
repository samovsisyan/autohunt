import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { AdminHeader } from "@/components/admin/ui";
import { ImportEditor } from "@/components/admin/import-editor";
import { importEditorLookups } from "@/server/actions/admin/lookups";
import { adminTitle, getAdminT } from "@/i18n/admin";

export const generateMetadata = adminTitle((t) => t.imports.edit);

export default async function EditImportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [imp, lookups] = await Promise.all([
    db.import.findUnique({ where: { id }, include: { events: true, documents: { orderBy: { createdAt: "desc" } }, customer: { select: { name: true } } } }),
    importEditorLookups(),
  ]);
  if (!imp) notFound();
  const { t } = await getAdminT();
  return (
    <>
      <AdminHeader title={`${imp.vehicleTitle} ${imp.vehicleYear}`} description={`${imp.code} · ${imp.customer.name}`} back={{ href: "/admin/imports", label: t.imports.title }} />
      <ImportEditor
        {...lookups}
        documents={imp.documents.map((d) => ({ id: d.id, title: d.title, url: d.url, type: d.type }))}
        initial={{
          id: imp.id,
          code: imp.code,
          customerId: imp.customerId,
          carId: imp.carId,
          vehicleTitle: imp.vehicleTitle,
          vehicleYear: imp.vehicleYear,
          imageUrl: imp.imageUrl,
          vin: imp.vin,
          lotNumber: imp.lotNumber,
          auctionId: imp.auctionId,
          purchasePrice: imp.purchasePrice,
          estimatedTotal: imp.estimatedTotal,
          finalTotal: imp.finalTotal,
          paidAmount: imp.paidAmount,
          currentStage: imp.currentStage,
          notes: imp.notes,
          notifyCustomer: true,
          events: imp.events.map((e) => ({ stage: e.stage, status: e.status, date: e.date?.toISOString().slice(0, 10) ?? "", location: e.location, note: e.note })),
        }}
      />
    </>
  );
}
