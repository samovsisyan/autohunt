import Link from "next/link";
import { Car, CheckCircle2, BadgeDollarSign, Ship, Users, Inbox, Building2, ArrowRight } from "lucide-react";
import { db } from "@/server/db";
import { AdminHeader, Panel } from "@/components/admin/ui";
import { DashboardCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/badge";
import { fmt, formatDate, formatUsd } from "@/i18n/format";
import { adminTitle, getAdminT } from "@/i18n/admin";

export const generateMetadata = adminTitle((t) => t.dashboard.title);

export default async function AdminDashboard() {
  const { t, locale } = await getAdminT();
  const d = t.dashboard;
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
      <AdminHeader title={d.title} description={d.subtitle} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <DashboardCard label={d.totalCars} value={total} icon={Car} />
        <DashboardCard label={d.available} value={available} icon={CheckCircle2} tone="positive" />
        <DashboardCard label={d.sold} value={sold} icon={BadgeDollarSign} />
        <DashboardCard label={d.activeImports} value={activeImports} icon={Ship} tone="accent" />
        <DashboardCard label={d.customers} value={customers} icon={Users} />
        <DashboardCard label={d.requests} value={requests} icon={Inbox} hint={fmt(d.newCount, { count: newRequests })} tone="warning" />
        <DashboardCard label={d.corporateRequests} value={corporate} icon={Building2} />
        <Link href="/admin/calculator" className="flex flex-col justify-between rounded-2xl border border-dashed border-line-strong p-5 text-sm text-muted transition-colors hover:border-accent/50 hover:text-fg">
          {d.calculatorLink}
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Panel title={d.latestRequests} actions={<Link href="/admin/requests" className="text-sm text-accent hover:underline">{d.allRequests}</Link>}>
          <ul className="-my-3 divide-y divide-line">
            {recentRequests.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {r.name} <span className="font-normal text-subtle">· {t.enums.requestType[r.type]}</span>
                  </p>
                  <p className="truncate text-xs text-subtle">
                    {r.car ? `${r.car.year} ${r.car.brand} ${r.car.model} · ` : ""}
                    {r.phone} · {formatDate(r.createdAt, locale)}
                  </p>
                </div>
                <StatusBadge status={r.status} label={t.enums.requestStatus[r.status]} />
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title={d.activeImports} actions={<Link href="/admin/imports" className="text-sm text-accent hover:underline">{d.allImports}</Link>}>
          <ul className="-my-3 divide-y divide-line">
            {imports.map((i) => (
              <li key={i.id}>
                <Link href={`/admin/imports/${i.id}`} className="flex items-center justify-between gap-4 py-3 hover:text-accent">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {i.vehicleTitle} {i.vehicleYear}
                    </p>
                    <p className="truncate text-xs text-subtle">
                      {i.code} · {i.customer.name} · {formatUsd(i.estimatedTotal, locale)}
                    </p>
                  </div>
                  <StatusBadge status="CURRENT" label={t.enums.stage[i.currentStage]} />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
