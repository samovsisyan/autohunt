"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { blogAdminSchema, seoAdminSchema, type BlogAdminInput } from "@/server/validation/admin";
import { renderMarkdown } from "@/server/markdown";
import { AdminError, adminAction, revalidatePublic } from "./_utils";

export async function saveBlogPostAction(input: BlogAdminInput) {
  return adminAction(async () => {
    const d = blogAdminSchema.parse(input);
    const base = { category: d.category, authorName: d.authorName, coverImage: d.coverImage, published: d.published, publishedAt: new Date(d.publishedAt) };
    const id = await db.$transaction(async (tx) => {
      const post = d.id ? await tx.blogPost.update({ where: { id: d.id }, data: base }) : await tx.blogPost.create({ data: base });
      await tx.blogPostTranslation.deleteMany({ where: { postId: post.id } });
      for (const locale of ["hy", "ru", "en"] as const) {
        const t = d.translations[locale];
        if (t) await tx.blogPostTranslation.create({ data: { postId: post.id, locale, ...t } });
      }
      return post.id;
    });
    revalidatePublic();
    return { id };
  });
}

export async function deleteBlogPostAction(id: string) {
  return adminAction(async () => {
    await db.blogPost.delete({ where: { id } });
    revalidatePublic();
  });
}

export async function previewMarkdownAction(src: string) {
  return adminAction(async () => renderMarkdown(z.string().max(100000).parse(src)));
}

export async function saveSiteContentAction(key: string, locale: "hy" | "ru" | "en", data: Record<string, unknown>) {
  return adminAction(async () => {
    const k = z.string().regex(/^[a-z0-9.]+$/).max(60).parse(key);
    const l = z.enum(["hy", "ru", "en"]).parse(locale);
    const json = z.record(z.string(), z.unknown()).parse(data);
    if (JSON.stringify(json).length > 50000) throw new AdminError("contentTooLarge");
    await db.siteContent.upsert({ where: { key_locale: { key: k, locale: l } }, create: { key: k, locale: l, data: json as object }, update: { data: json as object } });
    revalidatePublic();
  });
}

export async function resetSiteContentAction(key: string, locale: "hy" | "ru" | "en") {
  return adminAction(async () => {
    await db.siteContent.deleteMany({ where: { key, locale } });
    revalidatePublic();
  });
}

export async function saveSeoEntryAction(input: z.input<typeof seoAdminSchema>) {
  return adminAction(async () => {
    const { id, ...data } = seoAdminSchema.parse(input);
    if (id) await db.seoEntry.update({ where: { id }, data });
    else await db.seoEntry.create({ data });
    revalidatePublic();
  });
}

export async function deleteSeoEntryAction(id: string) {
  return adminAction(async () => {
    await db.seoEntry.delete({ where: { id } });
    revalidatePublic();
  });
}
