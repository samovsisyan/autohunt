"use server";

import { db } from "@/server/db";
import { importAdminSchema, type ImportAdminInput } from "@/server/validation/admin";
import { adminAction } from "./_utils";
import { importStages } from "@/server/services/dashboard.service";

const stageLabel = (s: string) => s.replace("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export async function saveImportAction(input: ImportAdminInput) {
  return adminAction(async () => {
    const d = importAdminSchema.parse(input);
    const previous = d.id ? await db.import.findUnique({ where: { id: d.id }, select: { currentStage: true } }) : null;
    const data = {
      code: d.code,
      customerId: d.customerId,
      carId: d.carId,
      vehicleTitle: d.vehicleTitle,
      vehicleYear: d.vehicleYear,
      imageUrl: d.imageUrl,
      vin: d.vin,
      lotNumber: d.lotNumber,
      auctionId: d.auctionId,
      purchasePrice: d.purchasePrice,
      estimatedTotal: d.estimatedTotal,
      finalTotal: d.finalTotal,
      paidAmount: d.paidAmount,
      currentStage: d.currentStage,
      notes: d.notes,
      ...(d.breakdown !== undefined ? { breakdown: d.breakdown === null ? undefined : (d.breakdown as object) } : {}),
    };
    const id = await db.$transaction(async (tx) => {
      const imp = d.id ? await tx.import.update({ where: { id: d.id }, data }) : await tx.import.create({ data });
      await tx.importEvent.deleteMany({ where: { importId: imp.id } });
      await tx.importEvent.createMany({
        data: importStages.map((stage) => {
          const e = d.events.find((x) => x.stage === stage);
          return {
            importId: imp.id,
            stage,
            status: e?.status ?? "PENDING",
            date: e?.date ? new Date(e.date) : null,
            location: e?.location ?? null,
            note: e?.note ?? null,
          };
        }),
      });
      if (d.notifyCustomer && previous && previous.currentStage !== d.currentStage) {
        const ev = d.events.find((x) => x.stage === d.currentStage);
        await tx.notification.create({
          data: {
            userId: d.customerId,
            title: `${d.vehicleTitle}: ${stageLabel(d.currentStage)}`,
            body: [ev?.location, ev?.note].filter(Boolean).join(" · ") || `Your import ${d.code} moved to “${stageLabel(d.currentStage)}”.`,
            link: `/dashboard/imports/${imp.id}`,
          },
        });
      }
      return imp.id;
    });
    return { id };
  });
}

export async function deleteImportAction(id: string) {
  return adminAction(async () => {
    await db.import.delete({ where: { id } });
  });
}

export async function addImportDocumentAction(importId: string, doc: { title: string; url: string; type: string }) {
  return adminAction(async () => {
    const imp = await db.import.findUniqueOrThrow({ where: { id: importId }, select: { customerId: true, vehicleTitle: true } });
    const type = (["INVOICE", "BILL_OF_SALE", "TITLE", "BILL_OF_LADING", "CUSTOMS", "REGISTRATION", "INSPECTION", "VEHICLE_HISTORY", "AUCTION_SHEET", "OTHER"] as const).find((t) => t === doc.type) ?? "OTHER";
    if (!doc.title.trim() || !doc.url.trim()) throw new Error("Title and file are required");
    await db.document.create({ data: { userId: imp.customerId, importId, title: doc.title.trim().slice(0, 160), url: doc.url, type } });
    await db.notification.create({
      data: { userId: imp.customerId, title: "New document", body: `${doc.title} is available for ${imp.vehicleTitle}.`, link: "/dashboard/documents" },
    });
  });
}

export async function deleteDocumentAction(id: string) {
  return adminAction(async () => {
    await db.document.delete({ where: { id } });
  });
}
