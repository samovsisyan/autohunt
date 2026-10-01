import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { db } from "@/server/db";
import { AdminHeader, Panel } from "@/components/admin/ui";
import { RoleSelect } from "@/components/admin/customer-forms";
import { StatusBadge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { formatDate, formatUsd } from "@/i18n/format";
import { adminTitle, getAdminT } from "@/i18n/admin";

export const generateMetadata = adminTitle((t) => t.customers.metaTitle);

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = await db.user.findUnique({
    where: { id },
    include: {
      imports: { orderBy: { createdAt: "desc" } },
      requests: { orderBy: { createdAt: "desc" }, include: { car: { select: { year: true, brand: true, model: true } } } },
      calculations: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!u) notFound();
  const { t, locale } = await getAdminT();
  const c = t.customers;
  const usd = (n: number) => formatUsd(n, locale);
  const owed = u.imports.reduce((s, i) => s + (i.finalTotal ?? i.estimatedTotal), 0);
  const paid = u.imports.reduce((s, i) => s + i.paidAmount, 0);
  return (
    <>
      <AdminHeader
        title={u.name}
        description={[u.companyName, u.email, u.phone].filter(Boolean).join(" · ")}
        back={{ href: "/admin/customers", label: c.title }}
        actions={
          <>
            <RoleSelect id={u.id} role={u.role} />
            <Link href={`/admin/imports/new?customer=${u.id}`} className={buttonClasses("primary", "sm")}>
              <Plus className="size-4" /> {c.newImport}
            </Link>
          </>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          [c.statImports, u.imports.length],
          [c.statTotal, usd(owed)],
          [c.statPaid, usd(paid)],
          [c.statBalance, usd(Math.max(0, owed - paid))],
        ].map(([k, v]) => (
          <div key={String(k)} className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-xs text-subtle">{k}</p>
            <p className="mt-1 font-display text-xl font-semibold tabular">{v}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title={c.imports}>
          <ul className="-my-2 divide-y divide-line">
            {u.imports.map((i) => (
              <li key={i.id}>
                <Link href={`/admin/imports/${i.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-accent">
                  <span>
                    <span className="block text-sm font-medium">
                      {i.vehicleTitle} {i.vehicleYear}
                    </span>
                    <span className="block text-xs text-subtle">
                      {i.code} · {usd(i.paidAmount)} / {usd(i.finalTotal ?? i.estimatedTotal)}
                    </span>
                  </span>
                  <StatusBadge status={i.currentStage === "READY" ? "READY" : "CURRENT"} label={t.enums.stage[i.currentStage]} />
                </Link>
              </li>
            ))}
            {!u.imports.length && <li className="py-3 text-sm text-muted">{c.noImports}</li>}
          </ul>
        </Panel>
        <Panel title={c.requests}>
          <ul className="-my-2 divide-y divide-line">
            {u.requests.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span>
                  {t.enums.requestType[r.type]}
                  {r.car && <span className="text-muted"> · {r.car.year} {r.car.brand} {r.car.model}</span>}
                  <span className="block text-xs text-subtle">{formatDate(r.createdAt, locale)}</span>
                </span>
                <StatusBadge status={r.status} label={t.enums.requestStatus[r.status]} />
              </li>
            ))}
            {!u.requests.length && <li className="py-3 text-sm text-muted">{c.noRequests}</li>}
          </ul>
        </Panel>
        <Panel title={c.calculations}>
          <ul className="-my-2 divide-y divide-line">
            {u.calculations.map((calc) => (
              <li key={calc.id} className="flex justify-between py-3 text-sm">
                <span>{calc.label ?? calc.shareId}</span>
                <span className="tabular text-positive">{usd((calc.result as { total: number }).total)}</span>
              </li>
            ))}
            {!u.calculations.length && <li className="py-3 text-sm text-muted">{t.common.none}</li>}
          </ul>
        </Panel>
      </div>
    </>
  );
}
