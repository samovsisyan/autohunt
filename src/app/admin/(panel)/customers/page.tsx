import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/server/db";
import type { Prisma } from "@/generated/prisma/client";
import { AdminHeader } from "@/components/admin/ui";
import { Table, THead, Th, Tr, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { formatDate } from "@/i18n/format";
import { cn } from "@/lib/cn";

export const metadata = { title: "Customers" };

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ role?: string; q?: string }> }) {
  const { role = "ALL", q } = await searchParams;
  const where: Prisma.UserWhereInput = {
    ...(role !== "ALL" ? { role: role as Prisma.UserWhereInput["role"] } : {}),
    ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }, { companyName: { contains: q, mode: "insensitive" } }] } : {}),
  };
  const users = await db.user.findMany({ where, orderBy: { createdAt: "desc" }, include: { _count: { select: { imports: true, requests: true, calculations: true } } } });
  return (
    <>
      <AdminHeader
        title="Customers"
        description="Individual and corporate customers, with their imports and requests."
        actions={
          <Link href="/admin/customers/new" className={buttonClasses("primary", "sm")}>
            <Plus className="size-4" /> Add customer
          </Link>
        }
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1">
          {["ALL", "CUSTOMER", "CORPORATE", "ADMIN"].map((r) => (
            <Link key={r} href={`/admin/customers?role=${r}`} className={cn("h-8 rounded-full border px-3 text-xs leading-8", r === role ? "border-accent/50 bg-accent-soft text-fg" : "border-line text-muted hover:text-fg")}>
              {r === "CUSTOMER" ? "individual" : r.toLowerCase()}
            </Link>
          ))}
        </div>
        <form className="sm:w-72">
          <input type="hidden" name="role" value={role} />
          <input name="q" defaultValue={q} placeholder="Search name, email, phone…" className="h-10 w-full rounded-xl border border-line bg-white/[0.03] px-4 text-sm outline-none focus:border-accent/60" />
        </form>
      </div>
      <Table>
        <THead>
          <tr>
            <Th>Name</Th>
            <Th>Contact</Th>
            <Th>Type</Th>
            <Th className="text-right">Imports</Th>
            <Th className="text-right">Requests</Th>
            <Th>Since</Th>
          </tr>
        </THead>
        <tbody>
          {users.map((u) => (
            <Tr key={u.id}>
              <Td>
                <Link href={`/admin/customers/${u.id}`} className="font-medium hover:text-accent">
                  {u.name}
                </Link>
                {u.companyName && <span className="block text-xs text-subtle">{u.companyName}</span>}
              </Td>
              <Td>
                <span className="block">{u.email}</span>
                <span className="block text-xs text-subtle">{u.phone ?? "—"}</span>
              </Td>
              <Td>
                <Badge tone={u.role === "CORPORATE" ? "accent" : u.role === "ADMIN" ? "warning" : "neutral"}>{u.role === "CUSTOMER" ? "individual" : u.role.toLowerCase()}</Badge>
              </Td>
              <Td className="text-right tabular">{u._count.imports}</Td>
              <Td className="text-right tabular">{u._count.requests}</Td>
              <Td className="text-muted">{formatDate(u.createdAt, "en")}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
