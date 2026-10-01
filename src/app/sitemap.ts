import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { absoluteUrl } from "@/lib/site";
import { getAllCarSlugs } from "@/server/services/car.service";
import { getAllPostSlugs } from "@/server/services/blog.service";

export const revalidate = 3600;

const staticPaths = [
  { path: "", priority: 1, changeFrequency: "daily" as const },
  { path: "/cars", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/rent", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/calculator", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/import", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/corporate", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/app", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" as const },
];

/** Localized sitemap: every URL lists its hy/ru/en alternates (hreflang). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cars, rentals, posts] = await Promise.all([getAllCarSlugs().catch(() => []), getAllCarSlugs("RENT").catch(() => []), getAllPostSlugs().catch(() => [])]);
  const alt = (path: string) => ({ languages: Object.fromEntries(locales.map((l) => [l, absoluteUrl(`/${l}${path}`)])) });

  const pages = staticPaths.flatMap(({ path, priority, changeFrequency }) =>
    locales.map((l) => ({ url: absoluteUrl(`/${l}${path}`), priority, changeFrequency, alternates: alt(path), lastModified: new Date() })),
  );

  const carUrls = cars.flatMap((c) =>
    locales.map((l) => ({ url: absoluteUrl(`/${l}/cars/${c.slug}`), lastModified: c.updatedAt, priority: 0.8, changeFrequency: "weekly" as const, alternates: alt(`/cars/${c.slug}`) })),
  );

  const rentalUrls = rentals.flatMap((c) =>
    locales.map((l) => ({ url: absoluteUrl(`/${l}/rent/${c.slug}`), lastModified: c.updatedAt, priority: 0.7, changeFrequency: "weekly" as const, alternates: alt(`/rent/${c.slug}`) })),
  );

  const postUrls = posts.flatMap((p) => {
    const languages = Object.fromEntries(p.translations.map((t) => [t.locale, absoluteUrl(`/${t.locale}/blog/${t.slug}`)]));
    return p.translations.map((t) => ({
      url: absoluteUrl(`/${t.locale}/blog/${t.slug}`),
      lastModified: p.updatedAt,
      priority: 0.6,
      changeFrequency: "monthly" as const,
      alternates: { languages },
    }));
  });

  return [...pages, ...carUrls, ...rentalUrls, ...postUrls];
}
