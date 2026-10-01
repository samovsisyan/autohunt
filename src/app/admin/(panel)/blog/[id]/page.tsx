import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { AdminHeader } from "@/components/admin/ui";
import { BlogEditor } from "@/components/admin/blog-editor";
import type { BlogAdminInput } from "@/server/validation/admin";
import { adminTitle, getAdminT } from "@/i18n/admin";

export const generateMetadata = adminTitle((t) => t.blog.edit);

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await db.blogPost.findUnique({ where: { id }, include: { translations: true } });
  if (!post) notFound();
  const { t, locale } = await getAdminT();
  const translations: BlogAdminInput["translations"] = {};
  for (const t of post.translations) {
    translations[t.locale] = { slug: t.slug, title: t.title, excerpt: t.excerpt, content: t.content, seoTitle: t.seoTitle ?? "", seoDescription: t.seoDescription ?? "" };
  }
  return (
    <>
      <AdminHeader title={post.translations.find((tr) => tr.locale === locale)?.title ?? post.translations[0]?.title ?? t.blog.edit} back={{ href: "/admin/blog", label: t.blog.title }} />
      <BlogEditor
        initial={{ id: post.id, category: post.category, authorName: post.authorName, coverImage: post.coverImage, published: post.published, publishedAt: post.publishedAt.toISOString().slice(0, 10), translations }}
      />
    </>
  );
}
