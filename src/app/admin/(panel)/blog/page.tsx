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
import { adminTitle, getAdminT } from "@/i18n/admin";

export const generateMetadata = adminTitle((t) => t.blog.title);

export default async function AdminBlogPage() {
  const { t, locale } = await getAdminT();
  const posts = await db.blogPost.findMany({ orderBy: { publishedAt: "desc" }, include: { translations: { select: { locale: true, title: true } } } });
  return (
    <>
      <AdminHeader
        title={t.blog.title}
        description={t.blog.subtitle}
        actions={
          <Link href="/admin/blog/new" className={buttonClasses("primary", "sm")}>
            <Plus className="size-4" /> {t.blog.new}
          </Link>
        }
      />
      <Table>
        <THead>
          <tr>
            <Th>{t.blog.colArticle}</Th>
            <Th>{t.blog.colCategory}</Th>
            <Th>{t.common.languages}</Th>
            <Th>{t.common.status}</Th>
            <Th>{t.common.date}</Th>
          </tr>
        </THead>
        <tbody>
          {posts.map((p) => {
            const title = p.translations.find((tr) => tr.locale === locale)?.title ?? p.translations[0]?.title ?? t.common.untitled;
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
                <Td className="text-muted">{t.enums.blogCategory[p.category] ?? p.category}</Td>
                <Td>
                  <div className="flex gap-1">
                    {(["hy", "ru", "en"] as const).map((l) => (
                      <span key={l} className={cn("rounded px-1.5 py-0.5 text-[10px] uppercase", p.translations.some((tr) => tr.locale === l) ? "bg-positive-soft text-positive" : "bg-warning-soft text-warning")}>
                        {l}
                      </span>
                    ))}
                  </div>
                </Td>
                <Td>{p.published ? <Badge tone="positive">{t.common.published}</Badge> : <Badge>{t.common.draft}</Badge>}</Td>
                <Td className="text-muted">{formatDate(p.publishedAt, locale)}</Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
