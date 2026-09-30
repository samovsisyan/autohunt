import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/server/db";
import { AdminHeader } from "@/components/admin/ui";
import { Table, THead, Th, Tr, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { formatDate } from "@/i18n/format";
import { cn } from "@/lib/cn";

export const metadata = { title: "Blog" };

export default async function AdminBlogPage() {
  const posts = await db.blogPost.findMany({ orderBy: { publishedAt: "desc" }, include: { translations: { select: { locale: true, title: true } } } });
  return (
    <>
      <AdminHeader
        title="Blog"
        description="Guides and news in Armenian, Russian and English. Each language has its own SEO title, description and slug."
        actions={
          <Link href="/admin/blog/new" className={buttonClasses("primary", "sm")}>
            <Plus className="size-4" /> New article
          </Link>
        }
      />
      <Table>
        <THead>
          <tr>
            <Th>Article</Th>
            <Th>Category</Th>
            <Th>Languages</Th>
            <Th>Status</Th>
            <Th>Date</Th>
          </tr>
        </THead>
        <tbody>
          {posts.map((p) => {
            const title = p.translations.find((t) => t.locale === "en")?.title ?? p.translations[0]?.title ?? "(untitled)";
            return (
              <Tr key={p.id}>
                <Td>
                  <Link href={`/admin/blog/${p.id}`} className="flex items-center gap-3 hover:text-accent">
                    <span className="relative h-10 w-16 shrink-0 overflow-hidden rounded-lg bg-elevated">
                      <Image src={p.coverImage} alt="" fill sizes="64px" className="object-cover" />
                    </span>
                    <span className="font-medium">{title}</span>
                  </Link>
                </Td>
                <Td className="text-muted">{p.category.replace("_", " ").toLowerCase()}</Td>
                <Td>
                  <div className="flex gap-1">
                    {(["hy", "ru", "en"] as const).map((l) => (
                      <span key={l} className={cn("rounded px-1.5 py-0.5 text-[10px] uppercase", p.translations.some((t) => t.locale === l) ? "bg-positive-soft text-positive" : "bg-warning-soft text-warning")}>
                        {l}
                      </span>
                    ))}
                  </div>
                </Td>
                <Td>{p.published ? <Badge tone="positive">published</Badge> : <Badge>draft</Badge>}</Td>
                <Td className="text-muted">{formatDate(p.publishedAt, "en")}</Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
