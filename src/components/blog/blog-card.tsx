import Image from "next/image";
import Link from "next/link";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatDate } from "@/i18n/format";
import type { BlogCard as BlogCardData } from "@/server/services/blog.service";
import { cn } from "@/lib/cn";

export function BlogCard({ post, locale, t, featured }: { post: BlogCardData; locale: Locale; t: Dictionary; featured?: boolean }) {
  return (
    <article className={cn("group relative flex flex-col", featured && "lg:col-span-2 lg:grid lg:grid-cols-2 lg:gap-8")}>
      <div className={cn("relative aspect-[16/10] overflow-hidden rounded-3xl border border-line bg-elevated", featured && "lg:aspect-auto lg:min-h-80")}>
        <Image
          src={post.coverImage}
          alt=""
          fill
          sizes={featured ? "(min-width: 1024px) 640px, 100vw" : "(min-width: 1024px) 400px, 100vw"}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      </div>
      <div className={cn("flex flex-1 flex-col pt-5", featured && "lg:justify-center lg:pt-0")}>
        <div className="flex items-center gap-3 text-xs text-subtle">
          <span className="rounded-full border border-line px-2.5 py-1 text-accent">{t.blog.categories[post.category]}</span>
          <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt, locale)}</time>
          <span>·</span>
          <span>
            {post.readingMinutes} {t.common.minRead}
          </span>
        </div>
        <h3 className={cn("mt-3 font-display font-semibold tracking-tight text-balance", featured ? "text-2xl sm:text-3xl" : "text-lg leading-snug")}>
          <Link href={href(locale, `/blog/${post.slug}`)} className="after:absolute after:inset-0 group-hover:text-accent">
            {post.title}
          </Link>
        </h3>
        <p className={cn("mt-2.5 text-sm leading-relaxed text-muted", !featured && "line-clamp-2")}>{post.excerpt}</p>
      </div>
    </article>
  );
}
