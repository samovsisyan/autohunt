import Link from "next/link";
import { Car, CheckCircle2, BadgeDollarSign, Ship, Users, Inbox, Building2, ArrowRight } from "lucide-react";
import { db } from "@/server/db";
import { AdminHeader, Panel } from "@/components/admin/ui";
import { DashboardCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate, formatUsd } from "@/i18n/format";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const [total, available, sold, activeImports, customers, requests, newRequests, corporate, recentRequests, imports] = await Promise.all([
    db.car.count(),
    db.car.count({ where: { status: "AVAILABLE", published: true } }),
    db.car.count({ where: { status: "SOLD" } }),
    db.import.count({ where: { currentStage: { not: "READY" } } }),
    db.user.count({ where: { role: { in: ["CUSTOMER", "CORPORATE"] } } }),
    db.request.count(),
    db.request.count({ where: { status: "NEW" } }),
    db.request.count({ where: { type: "CORPORATE" } }),
    db.request.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { car: { select: { brand: true, model: true, year: true } } } }),
    db.import.findMany({ where: { currentStage: { not: "READY" } }, orderBy: { updatedAt: "desc" }, take: 6, include: { customer: { select: { name: true } } } }),
  ]);

  return (
    <>
      <AdminHeader title="Dashboard" description="What's happening at AutoHunt today." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <DashboardCard label="Total cars" value={total} icon={Car} />
        <DashboardCard label="Available" value={available} icon={CheckCircle2} tone="positive" />
        <DashboardCard label="Sold" value={sold} icon={BadgeDollarSign} />
        <DashboardCard label="Active imports" value={activeImports} icon={Ship} tone="accent" />
        <DashboardCard label="Customers" value={customers} icon={Users} />
        <DashboardCard label="Requests" value={requests} icon={Inbox} hint={`${newRequests} new`} tone="warning" />
        <DashboardCard label="Corporate requests" value={corporate} icon={Building2} />
        <Link href="/admin/calculator" className="flex flex-col justify-between rounded-2xl border border-dashed border-line-strong p-5 text-sm text-muted transition-colors hover:border-accent/50 hover:text-fg">
          Calculator rates & rules
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Panel title="Latest requests" actions={<Link href="/admin/requests" className="text-sm text-accent hover:underline">All requests</Link>}>
          <ul className="-my-3 divide-y divide-line">
            {recentRequests.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {r.name} <span className="font-normal text-subtle">· {r.type.replace("_", " ").toLowerCase()}</span>
                  </p>
                  <p className="truncate text-xs text-subtle">
                    {r.car ? `${r.car.year} ${r.car.brand} ${r.car.model} · ` : ""}
                    {r.phone} · {formatDate(r.createdAt, "en")}
                  </p>
                </div>
                <StatusBadge status={r.status} label={r.status.replace("_", " ").toLowerCase()} />
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Active imports" actions={<Link href="/admin/imports" className="text-sm text-accent hover:underline">All imports</Link>}>
          <ul className="-my-3 divide-y divide-line">
            {imports.map((i) => (
              <li key={i.id}>
                <Link href={`/admin/imports/${i.id}`} className="flex items-center justify-between gap-4 py-3 hover:text-accent">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {i.vehicleTitle} {i.vehicleYear}
                    </p>
                    <p className="truncate text-xs text-subtle">
                      {i.code} · {i.customer.name} · {formatUsd(i.estimatedTotal)}
                    </p>
                  </div>
                  <StatusBadge status="CURRENT" label={i.currentStage.replace("_", " ").toLowerCase()} />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
