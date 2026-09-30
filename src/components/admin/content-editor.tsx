"use client";

import { useState } from "react";
import { Plus, Trash2, Save, RotateCcw } from "lucide-react";
import { saveSiteContentAction, resetSiteContentAction } from "@/server/actions/admin/content";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { useAdminAction } from "./hooks";

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
const pretty = (k: string) => k.replace(/([A-Z])/g, " $1").replace(/^\w/, (c) => c.toUpperCase());

function StringField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      {value.length > 90 ? <Textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} /> : <Input value={value} onChange={(e) => onChange(e.target.value)} />}
    </Field>
  );
}

/** Renders a form for any JSON shape: strings, string lists and lists of objects. */
function NodeEditor({ label, value, onChange }: { label: string; value: Json; onChange: (v: Json) => void }) {
  if (typeof value === "string" || typeof value === "number") return <StringField label={label} value={String(value)} onChange={onChange} />;
  if (Array.isArray(value)) {
    const template: Json = value.length && typeof value[0] === "object" && value[0] !== null ? Object.fromEntries(Object.keys(value[0] as object).map((k) => [k, ""])) : "";
    return (
      <fieldset className="rounded-xl border border-line p-4">
        <legend className="px-1 text-[0.8125rem] font-medium text-muted">{label}</legend>
        <div className="space-y-3">
          {value.map((item, i) => (
            <div key={i} className="flex gap-2">
              <div className="flex-1">
                {typeof item === "object" && item !== null && !Array.isArray(item) ? (
                  <div className="grid gap-3 rounded-lg bg-white/[0.02] p-3">
                    {Object.entries(item).map(([k, v]) => (
                      <NodeEditor key={k} label={pretty(k)} value={v} onChange={(nv) => onChange(value.map((x, j) => (j === i ? { ...(x as object), [k]: nv } : x)) as Json)} />
                    ))}
                  </div>
                ) : (
                  <Input value={String(item ?? "")} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove item">
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => onChange([...value, template])}>
          <Plus className="size-4" /> Add
        </Button>
      </fieldset>
    );
  }
  if (value && typeof value === "object") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Object.entries(value).map(([k, v]) => (
          <div key={k} className={typeof v === "string" && v.length < 90 ? "" : "sm:col-span-2"}>
            <NodeEditor label={pretty(k)} value={v} onChange={(nv) => onChange({ ...value, [k]: nv })} />
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function ContentEditor({ contentKey, locale, initial, overridden }: { contentKey: string; locale: "hy" | "ru" | "en"; initial: Record<string, Json>; overridden: boolean }) {
  const [value, setValue] = useState<Json>(initial);
  const { run, pending } = useAdminAction();
  return (
    <div>
      <NodeEditor label="" value={value} onChange={setValue} />
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4">
        {overridden ? (
          <Button variant="ghost" size="sm" onClick={() => run(() => resetSiteContentAction(contentKey, locale), { success: "Reset to defaults" })}>
            <RotateCcw className="size-4" /> Reset to default text
          </Button>
        ) : (
          <span className="text-xs text-subtle">Showing default text from the translation files.</span>
        )}
        <Button size="sm" loading={pending} onClick={() => run(() => saveSiteContentAction(contentKey, locale, value as Record<string, unknown>), { success: "Content published" })}>
          <Save className="size-4" /> Save & publish
        </Button>
      </div>
    </div>
  );
}
