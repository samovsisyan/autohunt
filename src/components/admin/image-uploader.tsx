"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2, Star } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { useAdminT } from "./i18n";

export async function uploadFiles(files: FileList | File[], folder: string, failed = "Upload failed"): Promise<string[]> {
  const fd = new FormData();
  fd.set("folder", folder);
  Array.from(files).forEach((f) => fd.append("file", f));
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error?.details ?? data?.error?.code ?? failed);
  return data.urls as string[];
}

export function GalleryUploader({ value, onChange, folder = "cars" }: { value: { url: string; alt: string | null }[]; onChange: (v: { url: string; alt: string | null }[]) => void; folder?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const { t } = useAdminT();
  const u = t.upload;

  async function add(files: FileList | File[]) {
    if (!files.length) return;
    setBusy(true);
    try {
      const urls = await uploadFiles(files, folder, t.common.uploadFailed);
      onChange([...value, ...urls.map((url) => ({ url, alt: null }))]);
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }
  const move = (i: number, d: number) => {
    const next = [...value];
    const [x] = next.splice(i, 1);
    next.splice(Math.max(0, Math.min(next.length, i + d)), 0, x);
    onChange(next);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {value.map((img, i) => (
          <div key={img.url + i} className="group overflow-hidden rounded-xl border border-line bg-elevated">
            <div className="relative aspect-[4/3]">
              <Image src={img.url} alt="" fill sizes="240px" className="object-cover" />
              {i === 0 && (
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] text-white">
                  <Star className="size-3 text-warning" /> {u.cover}
                </span>
              )}
              <div className="absolute inset-x-2 bottom-2 flex justify-between opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(i, -1)} className="grid size-7 place-items-center rounded-lg bg-black/70 text-white hover:bg-black" aria-label={u.moveLeft}>
                    <ArrowLeft className="size-3.5" />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} className="grid size-7 place-items-center rounded-lg bg-black/70 text-white hover:bg-black" aria-label={u.moveRight}>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
                <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="grid size-7 place-items-center rounded-lg bg-black/70 text-danger hover:bg-black" aria-label={u.removeImage}>
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
            <input
              value={img.alt ?? ""}
              onChange={(e) => onChange(value.map((v, j) => (j === i ? { ...v, alt: e.target.value || null } : v)))}
              placeholder={u.altText}
              className="w-full border-t border-line bg-transparent px-2.5 py-1.5 text-xs outline-none placeholder:text-subtle focus:bg-fg/5"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            add(e.dataTransfer.files);
          }}
          className={cn("flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-muted transition-colors hover:border-accent/60 hover:text-fg", drag ? "border-accent bg-accent-soft" : "border-line-strong")}
        >
          {busy ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
          {busy ? t.common.uploading : u.addPhotos}
          <span className="text-[11px] text-subtle">{u.formats}</span>
        </button>
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => e.target.files && add(e.target.files)} />
    </div>
  );
}

export function SingleUpload({ value, onChange, folder, accept = "image/jpeg,image/png,image/webp,image/avif", label }: { value: string; onChange: (v: string) => void; folder: string; accept?: string; label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const { t } = useAdminT();
  return (
    <div className="flex items-center gap-3">
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={t.upload.urlPlaceholder} className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-fg/[0.03] px-3 text-sm outline-none focus:border-accent/60" />
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-line-strong px-4 text-sm hover:bg-fg/5"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
        {label ?? t.common.upload}
      </button>
      <input
        ref={input}
        type="file"
        accept={accept}
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setBusy(true);
          try {
            const [url] = await uploadFiles([f], folder, t.common.uploadFailed);
            onChange(url);
          } catch (err) {
            toast((err as Error).message, "error");
          } finally {
            setBusy(false);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}
