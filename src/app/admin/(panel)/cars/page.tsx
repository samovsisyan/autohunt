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
import { adminTitle, getAdminT } from "@/i18n/admin";

export const generateMetadata = adminTitle((t) => t.cars.title);

const STATUSES = ["ALL", "RENT", "AVAILABLE", "RESERVED", "IN_TRANSIT", "SOLD", "UNPUBLISHED"] as const;

export default async function AdminCarsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status = "ALL", q } = await searchParams;
  const { t, locale } = await getAdminT();
  const c = t.cars;
  const statusLabel = (s: (typeof STATUSES)[number]) => (s === "ALL" ? c.filterAll : s === "UNPUBLISHED" ? c.filterUnpublished : s === "RENT" ? c.filterRent : t.enums.carStatus[s]);
  const where: Prisma.CarWhereInput = {
    ...(status === "UNPUBLISHED"
      ? { published: false }
      : status === "RENT"
        ? { listingType: "RENT" as const }
        : status !== "ALL"
          ? { status: status as Prisma.CarWhereInput["status"] }
          : {}),
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
        title={c.title}
        description={c.subtitle}
        actions={
          <>
            <Link href="/admin/cars/new?type=RENT" className={buttonClasses("outline", "sm")}>
              <Plus className="size-4" /> {c.addRental}
            </Link>
            <Link href="/admin/cars/new" className={buttonClasses("primary", "sm")}>
              <Plus className="size-4" /> {c.add}
            </Link>
          </>
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
              {statusLabel(s)}
            </Link>
          ))}
        </div>
        <form className="sm:w-72">
          <input type="hidden" name="status" value={status} />
          <input name="q" defaultValue={q} placeholder={c.search} className="h-10 w-full rounded-xl border border-line bg-fg/[0.03] px-4 text-sm outline-none focus:border-accent/60" />
        </form>
      </div>
      <Table>
        <THead>
          <tr>
            <Th>{c.colCar}</Th>
            <Th>{t.common.price}</Th>
            <Th>{t.common.status}</Th>
            <Th>{t.common.languages}</Th>
            <Th>{t.common.location}</Th>
            <Th className="text-right">{t.common.actions}</Th>
          </tr>
        </THead>
        <tbody>
          {cars.map((car) => (
            <Tr key={car.id}>
              <Td>
                <Link href={`/admin/cars/${car.id}`} className="flex items-center gap-3 hover:text-accent">
                  <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-elevated">
                    {car.images[0] && <Image src={car.images[0].url} alt="" fill sizes="56px" className="object-cover" />}
                  </span>
                  <span>
                    <span className="block font-medium">
                      {car.year} {car.brand} {car.model} {car.trim}
                    </span>
                    <span className="block text-xs text-subtle">
                      {car.vin ?? car.slug}
                      {car.featured && ` · ${c.featured}`}
                    </span>
                  </span>
                </Link>
              </Td>
              <Td className="tabular font-medium">
                {formatUsd(car.price, locale)}
                {car.listingType === "RENT" && <span className="font-normal text-subtle"> {c.perDay}</span>}
              </Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {car.listingType === "RENT" && <Badge tone="accent">{c.rentBadge}</Badge>}
                  <StatusBadge status={car.status} label={t.enums.carStatus[car.status]} />
                  {!car.published && <Badge>{t.common.draft}</Badge>}
                </div>
              </Td>
              <Td>
                <div className="flex gap-1">
                  {(["hy", "ru", "en"] as const).map((l) => {
                    const ok = car.translations.some((t) => t.locale === l && t.description.trim());
                    return (
                      <span key={l} className={cn("rounded px-1.5 py-0.5 text-[10px] uppercase", ok ? "bg-positive-soft text-positive" : "bg-warning-soft text-warning")}>
                        {l}
                      </span>
                    );
                  })}
                </div>
              </Td>
              <Td className="text-muted">{car.location}</Td>
              <Td>
                <CarRowActions id={car.id} published={car.published} status={car.status} title={`${car.year} ${car.brand} ${car.model}`} />
              </Td>
            </Tr>
          ))}
          {!cars.length && (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted">
                {c.noMatch}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
}
