import "server-only";
import { db } from "@/server/db";
import type { ImportStage } from "@/generated/prisma/enums";

export const importStages: ImportStage[] = [
  "AUCTION",
  "PURCHASED",
  "PICKED_UP",
  "AT_PORT",
  "SHIPPING",
  "ARRIVED",
  "CUSTOMS",
  "REGISTRATION",
  "READY",
];

const importInclude = {
  auction: { select: { name: true } },
  events: true,
} as const;

function withTimeline<T extends { events: { stage: ImportStage }[] }>(imp: T) {
  const events = [...imp.events].sort((a, b) => importStages.indexOf(a.stage) - importStages.indexOf(b.stage));
  return { ...imp, events };
}

export async function getUserImports(userId: string) {
  const list = await db.import.findMany({
    where: { customerId: userId },
    orderBy: { createdAt: "desc" },
    include: importInclude,
  });
  return list.map(withTimeline);
}

export type UserImport = Awaited<ReturnType<typeof getUserImports>>[number];

export async function getUserImport(userId: string, id: string) {
  // Scoped by customerId: a user can never read another customer's import.
  const imp = await db.import.findFirst({
    where: { id, customerId: userId },
    include: { ...importInclude, documents: { orderBy: { createdAt: "desc" } } },
  });
  return imp ? withTimeline(imp) : null;
}

export async function getOverview(userId: string) {
  const [imports, calculations, unread, requests] = await Promise.all([
    getUserImports(userId),
    db.calculation.count({ where: { userId } }),
    db.notification.count({ where: { userId, read: false } }),
    db.request.count({ where: { userId } }),
  ]);
  const active = imports.filter((i) => i.currentStage !== "READY");
  const totalOwed = imports.reduce((s, i) => s + (i.finalTotal ?? i.estimatedTotal), 0);
  const paid = imports.reduce((s, i) => s + i.paidAmount, 0);
  return {
    imports,
    stats: {
      active: active.length,
      delivered: imports.length - active.length,
      paid,
      remaining: Math.max(0, totalOwed - paid),
      calculations,
      unread,
      requests,
    },
  };
}

export const getUserCalculations = (userId: string) =>
  db.calculation.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 });

export const getUserDocuments = (userId: string) =>
  db.document.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { import: { select: { vehicleTitle: true, code: true } } },
  });

export const getUserRequests = (userId: string) =>
  db.request.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { car: { select: { brand: true, model: true, year: true, slug: true } } },
  });

export const getUserNotifications = (userId: string) =>
  db.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 100 });

export const countUnread = (userId: string) => db.notification.count({ where: { userId, read: false } });

export const markAllNotificationsRead = (userId: string) =>
  db.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
