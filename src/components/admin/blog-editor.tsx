"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, Trash2, Eye, Pencil, ExternalLink } from "lucide-react";
import type { BlogAdminInput } from "@/server/validation/admin";
import { saveBlogPostAction, deleteBlogPostAction, previewMarkdownAction } from "@/server/actions/admin/content";
import { Button } from "@/components/ui/button";
import { Chip, Field, Input, Select, Textarea } from "@/components/ui/field";
import { slugify } from "@/lib/car";
import { Panel } from "./ui";
import { useAdminAction } from "./hooks";
import { ConfirmButton } from "./confirm-button";
import { SingleUpload } from "./image-uploader";

type L = "hy" | "ru" | "en";
type Tr = NonNullable<BlogAdminInput["translations"]["en"]>;
const emptyTr: Tr = { slug: "", title: "", excerpt: "", content: "", seoTitle: "", seoDescription: "" };
const CATS = ["CAR_IMPORT", "AUCTIONS", "CUSTOMS", "CAR_BUYING", "MAINTENANCE", "NEWS", "GUIDES"];

export function BlogEditor({ initial }: { initial: BlogAdminInput }) {
  const router = useRouter();
  const [post, setPost] = useState(initial);
  const [tab, setTab] = useState<L>("hy");
  const [preview, setPreview] = useState<string | null>(null);
  const { run, pending } = useAdminAction();
  const tr = post.translations[tab];
  const setTr = (patch: Partial<Tr> | null) =>
    setPost((p) => ({ ...p, translations: { ...p.translations, [tab]: patch === null ? undefined : { ...(p.translations[tab] ?? emptyTr), ...patch } } }));

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <Panel
        title="Content"
        actions={
          <div className="flex gap-1">
            {(["hy", "ru", "en"] as const).map((l) => (
              <Chip key={l} active={tab === l} onClick={() => { setTab(l); setPreview(null); }} className="h-8">
                {l.toUpperCase()}
                {!post.translations[l] && <span className="size-1.5 rounded-full bg-warning" title="Missing" />}
              </Chip>
            ))}
          </div>
        }
      >
        {!tr ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted">No {tab.toUpperCase()} version yet.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setTr({})}>
              Add {tab.toUpperCase()} translation
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Field label="Title">
              <Input value={tr.title} onChange={(e) => setTr({ title: e.target.value, ...(tr.slug ? {} : {}) })} onBlur={() => !tr.slug && setTr({ slug: slugify(tr.title) })} />
            </Field>
            <Field label="Slug" hint={`/${tab}/blog/${tr.slug || "…"} — latin letters for clean URLs`}>
              <Input value={tr.slug} onChange={(e) => setTr({ slug: slugify(e.target.value) })} />
            </Field>
            <Field label="Excerpt">
              <Textarea rows={2} value={tr.excerpt} onChange={(e) => setTr({ excerpt: e.target.value })} />
            </Field>
            <Field
              label={
                <span className="flex items-center justify-between">
                  Content (Markdown: ## headings, **bold**, lists, tables, [links](/en/calculator))
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-accent"
                    onClick={async () => {
                      if (preview !== null) return setPreview(null);
                      const res = await previewMarkdownAction(tr.content);
                      if (res.ok) setPreview(res.data ?? "");
                    }}
                  >
                    {preview !== null ? <Pencil className="size-3.5" /> : <Eye className="size-3.5" />}
                    {preview !== null ? "Edit" : "Preview"}
                  </button>
                </span>
              }
            >
              {preview !== null ? (
                <div className="prose-ah min-h-96 rounded-xl border border-line p-5" dangerouslySetInnerHTML={{ __html: preview }} />
              ) : (
                <Textarea rows={22} className="font-mono text-sm" value={tr.content} onChange={(e) => setTr({ content: e.target.value })} />
              )}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="SEO title" hint={`${(tr.seoTitle ?? "").length}/60`}>
                <Input value={tr.seoTitle ?? ""} onChange={(e) => setTr({ seoTitle: e.target.value })} />
              </Field>
              <Field label="SEO description" hint={`${(tr.seoDescription ?? "").length}/160`}>
                <Input value={tr.seoDescription ?? ""} onChange={(e) => setTr({ seoDescription: e.target.value })} />
              </Field>
            </div>
            <button type="button" onClick={() => setTr(null)} className="text-xs text-subtle hover:text-danger">
              Remove {tab.toUpperCase()} translation
            </button>
          </div>
        )}
      </Panel>

      <div className="space-y-6 xl:sticky xl:top-8 xl:self-start">
        <Panel title="Publishing">
          <div className="space-y-4">
            <Field label="Category">
              <Select value={post.category} onChange={(e) => setPost({ ...post, category: e.target.value as BlogAdminInput["category"] })} options={CATS.map((c) => ({ value: c, label: c.replace("_", " ").toLowerCase() }))} />
            </Field>
            <Field label="Author">
              <Input value={post.authorName} onChange={(e) => setPost({ ...post, authorName: e.target.value })} />
            </Field>
            <Field label="Publish date">
              <Input type="date" value={post.publishedAt.slice(0, 10)} onChange={(e) => setPost({ ...post, publishedAt: e.target.value })} />
            </Field>
            <Field label="Featured image">
              <SingleUpload value={post.coverImage} folder="blog" onChange={(v) => setPost({ ...post, coverImage: v })} />
            </Field>
            <label className="flex items-center justify-between rounded-xl border border-line px-4 py-3 text-sm">
              Published
              <input type="checkbox" checked={post.published} onChange={(e) => setPost({ ...post, published: e.target.checked })} className="accent-[var(--color-accent)]" />
            </label>
          </div>
          <div className="mt-5 grid gap-2">
            <Button loading={pending} onClick={() => run(() => saveBlogPostAction(post), { success: "Article saved", onSuccess: (d) => !post.id && d && router.replace(`/admin/blog/${d.id}`) })}>
              <Save className="size-4" /> Save article
            </Button>
            {post.id && tr?.slug && (
              <a href={`/${tab}/blog/${tr.slug}`} target="_blank" className="inline-flex h-10 items-center justify-center gap-2 text-sm text-muted hover:text-fg">
                <ExternalLink className="size-4" /> View {tab.toUpperCase()}
              </a>
            )}
            {post.id && (
              <ConfirmButton title="Delete article?" message="All language versions will be removed." onConfirm={() => run(() => deleteBlogPostAction(post.id!), { success: "Deleted", onSuccess: () => router.replace("/admin/blog") })}>
                <Trash2 className="size-4 text-danger" /> Delete
              </ConfirmButton>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
