import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Calculator as CalcIcon } from "lucide-react";
import { href, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formatDate } from "@/i18n/format";
import { buildMetadata } from "@/server/seo";
import { getAllPostSlugs, getPostBySlug, listPosts } from "@/server/services/blog.service";
import { renderMarkdown } from "@/server/markdown";
import { db } from "@/server/db";
import { Breadcrumbs } from "@/components/layout/page-header";
import { BlogCard } from "@/components/blog/blog-card";
import { buttonClasses } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 600;

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const posts = await getAllPostSlugs().catch(() => []);
  return posts.flatMap((p) => p.translations.filter((t) => t.locale === params.locale).map((t) => ({ slug: t.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/blog/[slug]">): Promise<Metadata> {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  const post = await getPostBySlug(locale, decodeURIComponent(slug));
  if (!post) return {};
  return buildMetadata({
    locale,
    path: `/blog/${post.slug}`,
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    image: post.coverImage,
    type: "article",
    alternatePaths: Object.fromEntries(Object.entries(post.alternates).map(([k, s]) => [k, `/blog/${s}`])),
    publishedTime: post.publishedAt.toISOString(),
    modifiedTime: post.updatedAt.toISOString(),
  });
}

export default async function BlogPostPage({ params }: PageProps<"/[locale]/blog/[slug]">) {
  const { locale: l, slug: rawSlug } = await params;
  const locale = l as Locale;
  const slug = decodeURIComponent(rawSlug);
  const post = await getPostBySlug(locale, slug);

  if (!post) {
    // Language switcher keeps the slug; map it to this locale's slug for the same article.
    const other = await db.blogPostTranslation.findFirst({
      where: { slug, locale: { in: locales.filter((x) => x !== locale) } },
      select: { post: { select: { translations: { where: { locale }, select: { slug: true } } } } },
    });
    const target = other?.post.translations[0]?.slug;
    if (target) permanentRedirect(href(locale, `/blog/${target}`));
    notFound();
  }

  const [t, related] = await Promise.all([getDictionary(locale), listPosts(locale, { category: post.category, take: 3, excludeId: post.postId })]);
  const url = absoluteUrl(href(locale, `/blog/${post.slug}`));

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    image: absoluteUrl(post.coverImage),
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    inLanguage: locale,
    author: { "@type": "Person", name: post.authorName },
    publisher: { "@id": `${absoluteUrl("/")}#organization` },
    mainEntityOfPage: url,
    articleSection: t.blog.categories[post.category],
  };

  return (
    <>
      <article className="pt-24 sm:pt-28">
        <header className="container-page max-w-4xl">
          <Breadcrumbs
            className="mb-8"
            items={[
              { name: t.nav.home, href: href(locale) },
              { name: t.nav.blog, href: href(locale, "/blog") },
              { name: post.title, href: href(locale, `/blog/${post.slug}`) },
            ]}
          />
          <Link href={`${href(locale, "/blog")}?category=${post.category}`} className="inline-flex rounded-full border border-line px-3 py-1 text-xs text-accent hover:border-accent/50">
            {t.blog.categories[post.category]}
          </Link>
          <h1 className="mt-5 font-display text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl">{post.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">{post.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-subtle">
            <span>
              {t.blog.by} <span className="text-fg">{post.authorName}</span>
            </span>
            <span>·</span>
            <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt, locale, { day: "numeric", month: "long", year: "numeric" })}</time>
            <span>·</span>
            <span>
              {post.readingMinutes} {t.common.minRead}
            </span>
          </div>
        </header>
        <div className="container-page mt-10 max-w-5xl">
          <div className="relative aspect-[2/1] overflow-hidden rounded-3xl border border-line">
            <Image src={post.coverImage} alt="" fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
          </div>
        </div>
        <div className="container-page mt-12 max-w-3xl">
          <div className="prose-ah" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />
          <aside className="mt-16 flex flex-col gap-5 rounded-3xl border border-line bg-surface p-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-xl font-semibold">{t.blog.ctaTitle}</p>
              <p className="mt-1 text-sm text-muted">{t.blog.ctaText}</p>
            </div>
            <Link href={href(locale, "/calculator")} className={buttonClasses("primary")}>
              <CalcIcon className="size-4" />
              {t.nav.calculator}
            </Link>
          </aside>
        </div>
      </article>
      {related.length > 0 && (
        <section className="container-page py-24">
          <h2 className="mb-10 font-display text-2xl font-semibold sm:text-3xl">{t.blog.related}</h2>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {related.map((p) => (
              <BlogCard key={p.id} post={p} locale={locale} t={t} />
            ))}
          </div>
        </section>
      )}
      <JsonLd data={articleLd} />
    </>
  );
}
