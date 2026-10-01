import Link from "next/link";
import { db } from "@/server/db";
import type { Prisma } from "@/generated/prisma/client";
import { AdminHeader } from "@/components/admin/ui";
import { RequestRow } from "@/components/admin/request-row";
import { cn } from "@/lib/cn";
import { adminTitle, getAdminT } from "@/i18n/admin";

export const generateMetadata = adminTitle((t) => t.requests.title);

const TYPES = ["ALL", "CAR_REQUEST", "RENTAL", "IMPORT", "CAR_SEARCH", "CORPORATE", "FINANCING", "CONTACT"];
const STATUSES = ["ALL", "NEW", "IN_PROGRESS", "QUOTED", "CLOSED"];

export default async function AdminRequestsPage({ searchParams }: { searchParams: Promise<{ type?: string; status?: string }> }) {
  const { type = "ALL", status = "ALL" } = await searchParams;
  const { t } = await getAdminT();
  const labels: Record<string, string> = { ALL: t.common.all, ...t.enums.requestType, ...t.enums.requestStatus };
  const where: Prisma.RequestWhereInput = {
    ...(type !== "ALL" ? { type: type as Prisma.RequestWhereInput["type"] } : {}),
    ...(status !== "ALL" ? { status: status as Prisma.RequestWhereInput["status"] } : {}),
  };
  const requests = await db.request.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { car: { select: { year: true, brand: true, model: true } }, user: { select: { email: true } } },
  });
  const chip = (key: "type" | "status", value: string, current: string) => (
    <Link
      key={value}
      href={`/admin/requests?type=${key === "type" ? value : type}&status=${key === "status" ? value : status}`}
      className={cn("h-8 shrink-0 rounded-full border px-3 text-xs leading-8", value === current ? "border-accent/50 bg-accent-soft text-fg" : "border-line text-muted hover:text-fg")}
    >
      {labels[value] ?? value}
    </Link>
  );
  return (
    <>
      <AdminHeader title={t.requests.title} description={t.requests.subtitle} />
      <div className="mb-3 no-scrollbar flex gap-1 overflow-x-auto">{TYPES.map((v) => chip("type", v, type))}</div>
      <div className="mb-6 no-scrollbar flex gap-1 overflow-x-auto">{STATUSES.map((v) => chip("status", v, status))}</div>
      <ul className="space-y-3">
        {requests.map((r) => (
          <RequestRow
            key={r.id}
            r={{
              id: r.id,
              type: r.type,
              status: r.status,
              name: r.name,
              phone: r.phone,
              email: r.email,
              company: r.company,
              message: r.message,
              payload: (r.payload as Record<string, unknown>) ?? null,
              locale: r.locale,
              createdAt: r.createdAt.toISOString(),
              car: r.car ? `${r.car.year} ${r.car.brand} ${r.car.model}` : null,
              user: r.user?.email ?? null,
            }}
          />
        ))}
        {!requests.length && <li className="rounded-2xl border border-dashed border-line-strong px-6 py-12 text-center text-sm text-muted">{t.requests.empty}</li>}
      </ul>
    </>
  );
}
