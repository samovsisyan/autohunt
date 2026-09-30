import "server-only";
import { db } from "@/server/db";
import type { BlogCategory } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/config";

export const blogCategories = ["CAR_IMPORT", "AUCTIONS", "CUSTOMS", "CAR_BUYING", "MAINTENANCE", "NEWS", "GUIDES"] as const;

export function isBlogCategory(v: string | undefined): v is BlogCategory {
  return !!v && (blogCategories as readonly string[]).includes(v);
}

const cardSelect = (locale: Locale) =>
  ({
    id: true,
    category: true,
    authorName: true,
    coverImage: true,
    publishedAt: true,
    translations: { where: { locale }, select: { slug: true, title: true, excerpt: true, content: true } },
  }) as const;

function toCard(p: {
  id: string;
  category: BlogCategory;
  authorName: string;
  coverImage: string;
  publishedAt: Date;
  translations: { slug: string; title: string; excerpt: string; content: string }[];
}) {
  const t = p.translations[0];
  if (!t) return null;
  return {
    id: p.id,
    category: p.category,
    authorName: p.authorName,
    coverImage: p.coverImage,
    publishedAt: p.publishedAt,
    slug: t.slug,
    title: t.title,
    excerpt: t.excerpt,
    readingMinutes: Math.max(2, Math.round(t.content.split(/\s+/).length / 200)),
  };
}

export type BlogCard = NonNullable<ReturnType<typeof toCard>>;

export async function listPosts(locale: Locale, opts: { category?: BlogCategory; take?: number; excludeId?: string } = {}) {
  const posts = await db.blogPost.findMany({
    where: {
      published: true,
      publishedAt: { lte: new Date() },
      category: opts.category,
      id: opts.excludeId ? { not: opts.excludeId } : undefined,
      translations: { some: { locale } },
    },
    orderBy: { publishedAt: "desc" },
    take: opts.take,
    select: cardSelect(locale),
  });
  return posts.map(toCard).filter((p): p is BlogCard => !!p);
}

export async function getPostBySlug(locale: Locale, slug: string) {
  const t = await db.blogPostTranslation.findUnique({
    where: { locale_slug: { locale, slug } },
    include: { post: { include: { translations: { select: { locale: true, slug: true } } } } },
  });
  if (!t || !t.post.published || t.post.publishedAt > new Date()) return null;
  return {
    ...t,
    category: t.post.category,
    authorName: t.post.authorName,
    coverImage: t.post.coverImage,
    publishedAt: t.post.publishedAt,
    updatedAt: t.post.updatedAt,
    alternates: Object.fromEntries(t.post.translations.map((x) => [x.locale, x.slug])) as Partial<Record<Locale, string>>,
    readingMinutes: Math.max(2, Math.round(t.content.split(/\s+/).length / 200)),
  };
}

export async function getAllPostSlugs() {
  return db.blogPost.findMany({
    where: { published: true, publishedAt: { lte: new Date() } },
    select: { updatedAt: true, translations: { select: { locale: true, slug: true } } },
  });
}
