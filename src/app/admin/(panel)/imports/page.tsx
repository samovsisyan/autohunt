import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/server/db";
import { AdminHeader } from "@/components/admin/ui";
import { Table, THead, Th, Tr, Td } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { formatDate, formatUsd } from "@/i18n/format";

export const metadata = { title: "Imports" };

export default async function AdminImportsPage() {
  const imports = await db.import.findMany({
    orderBy: { updatedAt: "desc" },
    include: { customer: { select: { name: true, email: true } }, auction: { select: { name: true } } },
  });
  return (
    <>
      <AdminHeader
        title="Imports"
        description="Every auction purchase from bid to hand-over. Stage changes notify the customer."
        actions={
          <Link href="/admin/imports/new" className={buttonClasses("primary", "sm")}>
            <Plus className="size-4" /> Create import
          </Link>
        }
      />
      <Table>
        <THead>
          <tr>
            <Th>Import</Th>
            <Th>Customer</Th>
            <Th>Stage</Th>
            <Th className="text-right">Purchase</Th>
            <Th className="text-right">Total</Th>
            <Th className="text-right">Paid</Th>
            <Th>Updated</Th>
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
                    {i.code} · {i.auction?.name ?? "—"} · {i.vin ?? "no VIN"}
                  </span>
                </Link>
              </Td>
              <Td>
                <span className="block">{i.customer.name}</span>
                <span className="block text-xs text-subtle">{i.customer.email}</span>
              </Td>
              <Td>
                <StatusBadge status={i.currentStage === "READY" ? "READY" : "CURRENT"} label={i.currentStage.replace("_", " ").toLowerCase()} />
              </Td>
              <Td className="text-right tabular">{formatUsd(i.purchasePrice)}</Td>
              <Td className="text-right tabular">
                {formatUsd(i.finalTotal ?? i.estimatedTotal)}
                <span className="block text-[10px] text-subtle">{i.finalTotal ? "final" : "estimated"}</span>
              </Td>
              <Td className="text-right tabular text-positive">{formatUsd(i.paidAmount)}</Td>
              <Td className="text-muted">{formatDate(i.updatedAt, "en")}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
