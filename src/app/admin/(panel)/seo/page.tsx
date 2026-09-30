import { db } from "@/server/db";
import { AdminHeader } from "@/components/admin/ui";
import { SeoEditor } from "@/components/admin/seo-editor";

export const metadata = { title: "SEO" };

export default async function SeoAdmin() {
  const rows = await db.seoEntry.findMany({ orderBy: [{ path: "asc" }, { locale: "asc" }] });
  return (
    <>
      <AdminHeader
        title="SEO"
        description="Override meta title, description, keywords, Open Graph image and canonical URL for any page and language. Paths are locale-less (e.g. /cars, /cars/toyota-camry-se-2022, /blog/…). Car and article SEO can also be set in their editors."
      />
      <SeoEditor rows={rows.map((r) => ({ id: r.id, path: r.path, locale: r.locale, title: r.title ?? "", description: r.description ?? "", keywords: r.keywords ?? "", ogImage: r.ogImage ?? "", canonical: r.canonical ?? "", noindex: r.noindex }))} />
    </>
  );
}
