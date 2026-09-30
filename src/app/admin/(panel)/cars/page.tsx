import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/server/db";
import type { Prisma } from "@/generated/prisma/client";
import { AdminHeader } from "@/components/admin/ui";
import { CarRowActions } from "@/components/admin/car-row-actions";
import { Table, THead, Th, Tr, Td } from "@/components/ui/table";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { formatUsd } from "@/i18n/format";
import { cn } from "@/lib/cn";

export const metadata = { title: "Cars" };

const STATUSES = ["ALL", "AVAILABLE", "RESERVED", "IN_TRANSIT", "SOLD", "UNPUBLISHED"] as const;

export default async function AdminCarsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status = "ALL", q } = await searchParams;
  const where: Prisma.CarWhereInput = {
    ...(status === "UNPUBLISHED" ? { published: false } : status !== "ALL" ? { status: status as Prisma.CarWhereInput["status"] } : {}),
    ...(q ? { OR: [{ brand: { contains: q, mode: "insensitive" } }, { model: { contains: q, mode: "insensitive" } }, { vin: { contains: q, mode: "insensitive" } }] } : {}),
  };
  const cars = await db.car.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { images: { take: 1, orderBy: { sortOrder: "asc" } }, translations: { select: { locale: true, description: true } } },
  });

  return (
    <>
      <AdminHeader
        title="Cars"
        description="Inventory available in Armenia. Changes appear on the website immediately."
        actions={
          <Link href="/admin/cars/new" className={buttonClasses("primary", "sm")}>
            <Plus className="size-4" /> Add car
          </Link>
        }
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={`/admin/cars?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={cn("h-8 shrink-0 rounded-full border px-3 text-xs leading-8", s === status ? "border-accent/50 bg-accent-soft text-fg" : "border-line text-muted hover:text-fg")}
            >
              {s.replace("_", " ").toLowerCase()}
            </Link>
          ))}
        </div>
        <form className="sm:w-72">
          <input type="hidden" name="status" value={status} />
          <input name="q" defaultValue={q} placeholder="Search brand, model, VIN…" className="h-10 w-full rounded-xl border border-line bg-white/[0.03] px-4 text-sm outline-none focus:border-accent/60" />
        </form>
      </div>
      <Table>
        <THead>
          <tr>
            <Th>Car</Th>
            <Th>Price</Th>
            <Th>Status</Th>
            <Th>Languages</Th>
            <Th>Location</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </THead>
        <tbody>
          {cars.map((c) => (
            <Tr key={c.id}>
              <Td>
                <Link href={`/admin/cars/${c.id}`} className="flex items-center gap-3 hover:text-accent">
                  <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-elevated">
                    {c.images[0] && <Image src={c.images[0].url} alt="" fill sizes="56px" className="object-cover" />}
                  </span>
                  <span>
                    <span className="block font-medium">
                      {c.year} {c.brand} {c.model} {c.trim}
                    </span>
                    <span className="block text-xs text-subtle">
                      {c.vin ?? c.slug}
                      {c.featured && " · ★ featured"}
                    </span>
                  </span>
                </Link>
              </Td>
              <Td className="tabular font-medium">{formatUsd(c.price)}</Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  <StatusBadge status={c.status} label={c.status.replace("_", " ").toLowerCase()} />
                  {!c.published && <Badge>draft</Badge>}
                </div>
              </Td>
              <Td>
                <div className="flex gap-1">
                  {(["hy", "ru", "en"] as const).map((l) => {
                    const ok = c.translations.some((t) => t.locale === l && t.description.trim());
                    return (
                      <span key={l} className={cn("rounded px-1.5 py-0.5 text-[10px] uppercase", ok ? "bg-positive-soft text-positive" : "bg-warning-soft text-warning")}>
                        {l}
                      </span>
                    );
                  })}
                </div>
              </Td>
              <Td className="text-muted">{c.location}</Td>
              <Td>
                <CarRowActions id={c.id} published={c.published} status={c.status} title={`${c.year} ${c.brand} ${c.model}`} />
              </Td>
            </Tr>
          ))}
          {!cars.length && (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted">
                No cars match.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
}
