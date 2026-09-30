import "server-only";
import type { Metadata } from "next";
import { locales, ogLocales, type Locale } from "@/i18n/config";
import { absoluteUrl } from "@/lib/site";
import { getSeoOverride } from "@/server/services/seo.service";

interface BuildMetadataInput {
  locale: Locale;
  /** Locale-less path, e.g. "/cars" or "/cars/toyota-camry-se-2022". Used for canonical + admin overrides. */
  path: string;
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article";
  /** Per-locale paths when slugs differ between languages (blog). */
  alternatePaths?: Partial<Record<Locale, string>>;
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  absoluteTitle?: boolean;
}

/**
 * Localized metadata with canonical, hreflang alternates (+x-default), Open Graph and Twitter cards.
 * Admin-managed SeoEntry rows (by path+locale) override title/description/keywords/OG image/canonical.
 */
export async function buildMetadata(input: BuildMetadataInput): Promise<Metadata> {
  const override = await getSeoOverride(input.path, input.locale);
  const title = override?.title || input.title;
  const description = override?.description || input.description;
  const image = absoluteUrl(override?.ogImage || input.image || "/opengraph-image");
  const localPath = (l: Locale) => `/${l}${(input.alternatePaths?.[l] ?? input.path) === "/" ? "" : (input.alternatePaths?.[l] ?? input.path)}`;
  const available = input.alternatePaths ? locales.filter((l) => input.alternatePaths![l]) : [...locales];
  const canonical = override?.canonical || absoluteUrl(localPath(input.locale));

  const languages: Record<string, string> = Object.fromEntries(available.map((l) => [l, absoluteUrl(localPath(l))]));
  if (available.includes("hy")) languages["x-default"] = absoluteUrl(localPath("hy"));

  return {
    title: input.absoluteTitle || override?.title ? { absolute: title } : title,
    description,
    keywords: override?.keywords || undefined,
    alternates: { canonical, languages },
    robots: input.noindex || override?.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: input.type ?? "website",
      siteName: "AutoHunt",
      title,
      description,
      url: canonical,
      locale: ogLocales[input.locale],
      alternateLocale: available.filter((l) => l !== input.locale).map((l) => ogLocales[l]),
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      ...(input.publishedTime ? { publishedTime: input.publishedTime, modifiedTime: input.modifiedTime } : {}),
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
