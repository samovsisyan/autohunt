"use client";

import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { saveSeoEntryAction, deleteSeoEntryAction } from "@/server/actions/admin/content";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Panel } from "./ui";
import { useAdminAction } from "./hooks";
import { ConfirmButton } from "./confirm-button";
import { SingleUpload } from "./image-uploader";
import { useAdminT } from "./i18n";
import { fmt } from "@/i18n/format";

export type SeoRow = { id?: string; path: string; locale: "hy" | "ru" | "en"; title: string; description: string; keywords: string; ogImage: string; canonical: string; noindex: boolean };

const PATHS = ["/", "/cars", "/calculator", "/import", "/corporate", "/app", "/about", "/blog"];

export function SeoEditor({ rows: initial }: { rows: SeoRow[] }) {
  const [rows, setRows] = useState(initial);
  const { run, pending } = useAdminAction();
  const { t } = useAdminT();
  const s = t.seo;
  const update = (i: number, patch: Partial<SeoRow>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (
    <div className="space-y-4">
      {rows.map((r, i) => (
        <Panel
          key={r.id ?? `n${i}`}
          title={
            <span className="flex flex-wrap items-center gap-2">
              <Input className="h-9 w-56 font-mono text-sm" list="seo-paths" value={r.path} onChange={(e) => update(i, { path: e.target.value })} />
              <Select className="h-9 w-24 text-sm" value={r.locale} onChange={(e) => update(i, { locale: e.target.value as SeoRow["locale"] })} options={["hy", "ru", "en"].map((l) => ({ value: l, label: l.toUpperCase() }))} />
            </span>
          }
          actions={
            <label className="flex items-center gap-2 text-xs text-muted">
              <input type="checkbox" checked={r.noindex} onChange={(e) => update(i, { noindex: e.target.checked })} className="accent-[var(--color-accent)]" /> noindex
            </label>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={s.metaTitle} hint={fmt(s.metaTitleHint, { count: r.title.length })}>
              <Input value={r.title} onChange={(e) => update(i, { title: e.target.value })} />
            </Field>
            <Field label={s.keywords} hint={s.keywordsHint}>
              <Input value={r.keywords} onChange={(e) => update(i, { keywords: e.target.value })} />
            </Field>
            <Field label={s.metaDescription} hint={`${r.description.length}/160`} className="sm:col-span-2">
              <Textarea rows={2} value={r.description} onChange={(e) => update(i, { description: e.target.value })} />
            </Field>
            <Field label={s.ogImage}>
              <SingleUpload value={r.ogImage} folder="seo" onChange={(v) => update(i, { ogImage: v })} />
            </Field>
            <Field label={s.canonical} hint={s.canonicalHint}>
              <Input value={r.canonical} onChange={(e) => update(i, { canonical: e.target.value })} placeholder="https://autohunt.am/hy/…" />
            </Field>
          </div>
          <div className="mt-5 flex justify-between border-t border-line pt-4">
            {r.id ? (
              <ConfirmButton title={s.deleteTitle} onConfirm={() => run(() => deleteSeoEntryAction(r.id!), { success: t.common.deleted })}>
                <Trash2 className="size-4 text-danger" />
              </ConfirmButton>
            ) : (
              <span />
            )}
            <Button size="sm" loading={pending} onClick={() => run(() => saveSeoEntryAction(r), { success: s.savedToast })}>
              <Save className="size-4" /> {t.common.save}
            </Button>
          </div>
        </Panel>
      ))}
      <datalist id="seo-paths">
        {PATHS.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
      <Button variant="outline" onClick={() => setRows([...rows, { path: "/", locale: "hy", title: "", description: "", keywords: "", ogImage: "", canonical: "", noindex: false }])}>
        <Plus className="size-4" /> {s.add}
      </Button>
    </div>
  );
}
