import { db } from "@/server/db";
import { AdminHeader } from "@/components/admin/ui";
import { SeoEditor } from "@/components/admin/seo-editor";
import { adminTitle, getAdminT } from "@/i18n/admin";

export const generateMetadata = adminTitle((t) => t.seo.title);

export default async function SeoAdmin() {
  const [rows, { t }] = await Promise.all([db.seoEntry.findMany({ orderBy: [{ path: "asc" }, { locale: "asc" }] }), getAdminT()]);
  return (
    <>
      <AdminHeader
        title={t.seo.title}
        description={t.seo.subtitle}
      />
      <SeoEditor rows={rows.map((r) => ({ id: r.id, path: r.path, locale: r.locale, title: r.title ?? "", description: r.description ?? "", keywords: r.keywords ?? "", ogImage: r.ogImage ?? "", canonical: r.canonical ?? "", noindex: r.noindex }))} />
    </>
  );
}
