import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { buildMetadata } from "@/server/seo";
import { blogCategories, isBlogCategory, listPosts } from "@/server/services/blog.service";
import { PageHeader } from "@/components/layout/page-header";
import { BlogCard } from "@/components/blog/blog-card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";

export async function generateMetadata({ params, searchParams }: PageProps<"/[locale]/blog">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getDictionary(locale);
  const meta = await buildMetadata({ locale, path: "/blog", title: t.meta.blog.title, description: t.meta.blog.description });
  if (Object.keys(await searchParams).length) meta.robots = { index: false, follow: true };
  return meta;
}

export default async function BlogPage({ params, searchParams }: PageProps<"/[locale]/blog">) {
  const locale = (await params).locale as Locale;
  const raw = (await searchParams).category;
  const category = typeof raw === "string" && isBlogCategory(raw) ? raw : undefined;
  const [t, posts] = await Promise.all([getDictionary(locale), listPosts(locale, { category })]);
  const [first, ...rest] = posts;

  return (
    <>
      <PageHeader
        crumbs={[
          { name: t.nav.home, href: href(locale) },
          { name: t.nav.blog, href: href(locale, "/blog") },
        ]}
        eyebrow={t.blog.eyebrow}
        title={t.blog.title}
        subtitle={t.blog.subtitle}
      >
        <nav className="no-scrollbar -mx-4 mt-10 flex gap-2 overflow-x-auto px-4" aria-label={t.blog.title}>
          {[undefined, ...blogCategories].map((c) => (
            <Link
              key={c ?? "all"}
              href={c ? `${href(locale, "/blog")}?category=${c}` : href(locale, "/blog")}
              aria-current={c === category ? "page" : undefined}
              className={cn(
                "inline-flex h-9 shrink-0 items-center rounded-full border px-4 text-sm transition-colors",
                c === category ? "border-accent/50 bg-accent-soft text-fg" : "border-line text-muted hover:text-fg",
              )}
            >
              {c ? t.blog.categories[c] : t.blog.allCategories}
            </Link>
          ))}
        </nav>
      </PageHeader>
      <section className="container-page py-16">
        {first ? (
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            <BlogCard post={first} locale={locale} t={t} featured />
            {rest.map((p) => (
              <BlogCard key={p.id} post={p} locale={locale} t={t} />
            ))}
          </div>
        ) : (
          <EmptyState icon={Newspaper} title={t.blog.empty} />
        )}
      </section>
    </>
  );
}
