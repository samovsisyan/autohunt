import { AdminHeader } from "@/components/admin/ui";
import { BlogEditor } from "@/components/admin/blog-editor";

export const metadata = { title: "New article" };

export default function NewPostPage() {
  return (
    <>
      <AdminHeader title="New article" back={{ href: "/admin/blog", label: "Blog" }} />
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
