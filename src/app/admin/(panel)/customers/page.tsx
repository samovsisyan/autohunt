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
import { adminTitle, getAdminT } from "@/i18n/admin";

export const generateMetadata = adminTitle((t) => t.customers.title);

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ role?: string; q?: string }> }) {
  const { role = "ALL", q } = await searchParams;
  const { t, locale } = await getAdminT();
  const c = t.customers;
  const roleLabel = (r: string) => (r === "ALL" ? t.common.all : t.enums.role[r as keyof typeof t.enums.role] ?? r);
  const where: Prisma.UserWhereInput = {
    ...(role !== "ALL" ? { role: role as Prisma.UserWhereInput["role"] } : {}),
    ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }, { companyName: { contains: q, mode: "insensitive" } }] } : {}),
  };
  const users = await db.user.findMany({ where, orderBy: { createdAt: "desc" }, include: { _count: { select: { imports: true, requests: true, calculations: true } } } });
  return (
    <>
      <AdminHeader
        title={c.title}
        description={c.subtitle}
        actions={
          <Link href="/admin/customers/new" className={buttonClasses("primary", "sm")}>
            <Plus className="size-4" /> {c.add}
          </Link>
        }
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1">
          {["ALL", "CUSTOMER", "CORPORATE", "ADMIN"].map((r) => (
            <Link key={r} href={`/admin/customers?role=${r}`} className={cn("h-8 rounded-full border px-3 text-xs leading-8", r === role ? "border-accent/50 bg-accent-soft text-fg" : "border-line text-muted hover:text-fg")}>
              {roleLabel(r)}
            </Link>
          ))}
        </div>
        <form className="sm:w-72">
          <input type="hidden" name="role" value={role} />
          <input name="q" defaultValue={q} placeholder={c.search} className="h-10 w-full rounded-xl border border-line bg-fg/[0.03] px-4 text-sm outline-none focus:border-accent/60" />
        </form>
      </div>
      <Table>
        <THead>
          <tr>
            <Th>{c.colName}</Th>
            <Th>{c.colContact}</Th>
            <Th>{c.colType}</Th>
            <Th className="text-right">{c.colImports}</Th>
            <Th className="text-right">{c.colRequests}</Th>
            <Th>{c.colSince}</Th>
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
                <Badge tone={u.role === "CORPORATE" ? "accent" : u.role === "ADMIN" ? "warning" : "neutral"}>{t.enums.role[u.role]}</Badge>
              </Td>
              <Td className="text-right tabular">{u._count.imports}</Td>
              <Td className="text-right tabular">{u._count.requests}</Td>
              <Td className="text-muted">{formatDate(u.createdAt, locale)}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
