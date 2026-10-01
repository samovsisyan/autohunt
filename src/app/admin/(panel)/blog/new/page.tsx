import { AdminHeader } from "@/components/admin/ui";
import { BlogEditor } from "@/components/admin/blog-editor";
import { adminTitle, getAdminT } from "@/i18n/admin";

export const generateMetadata = adminTitle((t) => t.blog.new);

export default async function NewPostPage() {
  const { t } = await getAdminT();
  return (
    <>
      <AdminHeader title={t.blog.new} back={{ href: "/admin/blog", label: t.blog.title }} />
      <BlogEditor
        initial={{
          category: "GUIDES",
          authorName: "AutoHunt",
          coverImage: "/images/site/fleet.jpg",
          published: false,
          publishedAt: new Date().toISOString().slice(0, 10),
          translations: { hy: { slug: "", title: "", excerpt: "", content: "" } },
        }}
      />
    </>
  );
}
