import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/server/db";
import { AdminHeader } from "@/components/admin/ui";
import { Table, THead, Th, Tr, Td } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { formatDate, formatUsd } from "@/i18n/format";
import { adminTitle, getAdminT } from "@/i18n/admin";

export const generateMetadata = adminTitle((t) => t.imports.title);

export default async function AdminImportsPage() {
  const { t, locale } = await getAdminT();
  const x = t.imports;
  const imports = await db.import.findMany({
    orderBy: { updatedAt: "desc" },
    include: { customer: { select: { name: true, email: true } }, auction: { select: { name: true } } },
  });
  return (
    <>
      <AdminHeader
        title={x.title}
        description={x.subtitle}
        actions={
          <Link href="/admin/imports/new" className={buttonClasses("primary", "sm")}>
            <Plus className="size-4" /> {x.create}
          </Link>
        }
      />
      <Table>
        <THead>
          <tr>
            <Th>{x.colImport}</Th>
            <Th>{x.colCustomer}</Th>
            <Th>{x.colStage}</Th>
            <Th className="text-right">{x.colPurchase}</Th>
            <Th className="text-right">{x.colTotal}</Th>
            <Th className="text-right">{x.colPaid}</Th>
            <Th>{x.colUpdated}</Th>
          </tr>
        </THead>
        <tbody>
          {imports.map((i) => (
            <Tr key={i.id}>
              <Td>
                <Link href={`/admin/imports/${i.id}`} className="hover:text-accent">
                  <span className="block font-medium">
                    {i.vehicleTitle} {i.vehicleYear}
                  </span>
                  <span className="block text-xs text-subtle">
                    {i.code} · {i.auction?.name ?? "—"} · {i.vin ?? t.common.noVin}
                  </span>
                </Link>
              </Td>
              <Td>
                <span className="block">{i.customer.name}</span>
                <span className="block text-xs text-subtle">{i.customer.email}</span>
              </Td>
              <Td>
                <StatusBadge status={i.currentStage === "READY" ? "READY" : "CURRENT"} label={t.enums.stage[i.currentStage]} />
              </Td>
              <Td className="text-right tabular">{formatUsd(i.purchasePrice, locale)}</Td>
              <Td className="text-right tabular">
                {formatUsd(i.finalTotal ?? i.estimatedTotal, locale)}
                <span className="block text-[10px] text-subtle">{i.finalTotal ? t.common.final : t.common.estimated}</span>
              </Td>
              <Td className="text-right tabular text-positive">{formatUsd(i.paidAmount, locale)}</Td>
              <Td className="text-muted">{formatDate(i.updatedAt, locale)}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
