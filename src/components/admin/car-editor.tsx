"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2, Save, ExternalLink } from "lucide-react";
import type { CarAdminInput } from "@/server/validation/admin";
import { saveCarAction } from "@/server/actions/admin/cars";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, Chip } from "@/components/ui/field";
import { slugify } from "@/lib/car";
import { cn } from "@/lib/cn";
import { Panel } from "./ui";
import { useAdminAction } from "./hooks";
import { GalleryUploader, SingleUpload } from "./image-uploader";
import { useAdminT } from "./i18n";
import { fmt } from "@/i18n/format";

const opts = (xs: string[], labels: Record<string, string>) => xs.map((x) => ({ value: x, label: labels[x] ?? x }));
const LOCALES = [
  { id: "hy", label: "Հայերեն" },
  { id: "ru", label: "Русский" },
  { id: "en", label: "English" },
] as const;
const DOC_TYPES = ["AUCTION_SHEET", "VEHICLE_HISTORY", "INSPECTION", "TITLE", "INVOICE", "BILL_OF_SALE", "OTHER"];

const num = (v: unknown) => (v === null || v === undefined ? "" : (v as number | string));

export const emptyCar: CarAdminInput = {
  slug: "",
  brand: "",
  model: "",
  trim: "",
  year: new Date().getFullYear() - 3,
  mileage: 0,
  mileageUnit: "MI",
  engineVolume: 2.0,
  horsepower: null,
  fuel: "GASOLINE",
  transmission: "AUTOMATIC",
  drive: "FWD",
  bodyType: "SEDAN",
  color: "",
  interior: "",
  vin: "",
  listingType: "SALE",
  price: 0,
  rentDeposit: null,
  rentMinDays: null,
  location: "Gyumri",
  source: "Copart",
  status: "AVAILABLE",
  published: false,
  featured: false,
  features: [],
  history: { owners: null, accidents: null, serviceRecords: null, titleStatus: "", lotNumber: "" },
  images: [],
  documents: [],
  translations: { hy: { description: "" }, ru: { description: "" }, en: { description: "" } },
};

export function CarEditor({ initial, rental }: { initial: CarAdminInput; rental?: boolean }) {
  const router = useRouter();
  const [car, setCar] = useState<CarAdminInput>(() => (rental ? { ...initial, listingType: "RENT", rentMinDays: initial.rentMinDays ?? 1 } : initial));
  const [tab, setTab] = useState<"hy" | "ru" | "en">("hy");
  const [slugTouched, setSlugTouched] = useState(!!initial.id);
  const { run, pending } = useAdminAction();
  const { t, locale } = useAdminT();
  const e_ = t.carEditor;
  const en = t.enums;

  const set = <K extends keyof CarAdminInput>(k: K, v: CarAdminInput[K]) =>
    setCar((c) => {
      const next = { ...c, [k]: v };
      if (!slugTouched && (k === "brand" || k === "model" || k === "trim" || k === "year")) {
        next.slug = slugify(`${next.brand} ${next.model} ${next.trim ?? ""} ${next.year}`);
      }
      return next;
    });
  const setT = (field: "description" | "seoTitle" | "seoDescription", v: string) =>
    setCar((c) => ({ ...c, translations: { ...c.translations, [tab]: { ...c.translations[tab], [field]: v } } }));

  const save = () =>
    run(() => saveCarAction(car), {
      success: e_.savedToast,
      onSuccess: (d) => {
        if (!car.id && d?.id) router.replace(`/admin/cars/${d.id}`);
      },
    });

  const tr = car.translations[tab] ?? { description: "" };
  const rent = car.listingType === "RENT";

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Panel title={e_.vehicle}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label={e_.brand}>
              <Input value={car.brand} onChange={(e) => set("brand", e.target.value)} />
            </Field>
            <Field label={e_.model}>
              <Input value={car.model} onChange={(e) => set("model", e.target.value)} />
            </Field>
            <Field label={e_.trim}>
              <Input value={car.trim ?? ""} onChange={(e) => set("trim", e.target.value)} />
            </Field>
            <Field label={t.common.year}>
              <Input type="number" value={num(car.year)} onChange={(e) => set("year", Number(e.target.value))} />
            </Field>
            <Field label={e_.mileage}>
              <div className="flex gap-2">
                <Input type="number" value={num(car.mileage)} onChange={(e) => set("mileage", Number(e.target.value))} />
                <Select className="w-24" value={car.mileageUnit} onChange={(e) => set("mileageUnit", e.target.value as "MI" | "KM")} options={[{ value: "MI", label: en.mileageUnit.MI }, { value: "KM", label: en.mileageUnit.KM }]} />
              </div>
            </Field>
            <Field label={e_.engine}>
              <Input type="number" step={0.1} value={num(car.engineVolume)} onChange={(e) => set("engineVolume", e.target.value === "" ? null : Number(e.target.value))} />
            </Field>
            <Field label={e_.horsepower}>
              <Input type="number" value={num(car.horsepower)} onChange={(e) => set("horsepower", e.target.value === "" ? null : Number(e.target.value))} />
            </Field>
            <Field label={e_.fuel}>
              <Select value={car.fuel} onChange={(e) => set("fuel", e.target.value as CarAdminInput["fuel"])} options={opts(["GASOLINE", "DIESEL", "HYBRID", "PLUGIN_HYBRID", "ELECTRIC"], en.fuel)} />
            </Field>
            <Field label={e_.transmission}>
              <Select value={car.transmission} onChange={(e) => set("transmission", e.target.value as CarAdminInput["transmission"])} options={opts(["AUTOMATIC", "MANUAL", "CVT", "ROBOTIC"], en.transmission)} />
            </Field>
            <Field label={e_.drive}>
              <Select value={car.drive} onChange={(e) => set("drive", e.target.value as CarAdminInput["drive"])} options={opts(["FWD", "RWD", "AWD", "FOUR_WD"], en.drive)} />
            </Field>
            <Field label={e_.bodyType}>
              <Select value={car.bodyType} onChange={(e) => set("bodyType", e.target.value as CarAdminInput["bodyType"])} options={opts(["SEDAN", "SUV", "CROSSOVER", "HATCHBACK", "COUPE", "WAGON", "PICKUP", "MINIVAN", "CONVERTIBLE"], en.body)} />
            </Field>
            <Field label={t.common.vin}>
              <Input value={car.vin ?? ""} onChange={(e) => set("vin", e.target.value.toUpperCase())} maxLength={17} />
            </Field>
            <Field label={e_.color}>
              <Input value={car.color ?? ""} onChange={(e) => set("color", e.target.value)} />
            </Field>
            <Field label={e_.interior}>
              <Input value={car.interior ?? ""} onChange={(e) => set("interior", e.target.value)} />
            </Field>
            <Field label={e_.source}>
              <Input value={car.source ?? ""} onChange={(e) => set("source", e.target.value)} placeholder="Copart / IAAI / Local" />
            </Field>
          </div>
          <Field label={e_.features} className="mt-4">
            <Textarea rows={4} value={car.features.join("\n")} onChange={(e) => set("features", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} />
          </Field>
        </Panel>

        <Panel title={e_.gallery} description={e_.galleryHint}>
          <GalleryUploader value={car.images.map((i) => ({ url: i.url, alt: i.alt ?? null }))} onChange={(v) => set("images", v)} />
        </Panel>

        <Panel
          title={e_.descriptionSeo}
          actions={
            <div className="flex gap-1">
              {LOCALES.map((l) => (
                <Chip key={l.id} active={tab === l.id} onClick={() => setTab(l.id)} className="h-8">
                  {l.label}
                  {!car.translations[l.id]?.description && <span className="size-1.5 rounded-full bg-warning" title={t.common.missing} />}
                </Chip>
              ))}
            </div>
          }
        >
          <div className="space-y-4">
            <Field label={e_.description}>
              <Textarea rows={8} value={tr.description ?? ""} onChange={(e) => setT("description", e.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={e_.seoTitle} hint={fmt(e_.recommended, { count: (tr.seoTitle ?? "").length, max: 60 })}>
                <Input value={tr.seoTitle ?? ""} onChange={(e) => setT("seoTitle", e.target.value)} />
              </Field>
              <Field label={e_.seoDescription} hint={fmt(e_.recommended, { count: (tr.seoDescription ?? "").length, max: 160 })}>
                <Input value={tr.seoDescription ?? ""} onChange={(e) => setT("seoDescription", e.target.value)} />
              </Field>
            </div>
          </div>
        </Panel>

        <Panel title={e_.history}>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {(["owners", "accidents", "serviceRecords"] as const).map((k) => (
              <Field key={k} label={e_[k]}>
                <Input type="number" value={num(car.history[k])} onChange={(e) => set("history", { ...car.history, [k]: e.target.value === "" ? null : Number(e.target.value) })} />
              </Field>
            ))}
            <Field label={e_.titleStatus}>
              <Input value={car.history.titleStatus ?? ""} onChange={(e) => set("history", { ...car.history, titleStatus: e.target.value })} />
            </Field>
            <Field label={t.common.lotNumber}>
              <Input value={car.history.lotNumber ?? ""} onChange={(e) => set("history", { ...car.history, lotNumber: e.target.value })} />
            </Field>
          </div>
          <div className="mt-6 space-y-3">
            {car.documents.map((d, i) => (
              <div key={i} className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-[1fr_180px_2fr_auto]">
                <Input value={d.title} placeholder={t.common.title} onChange={(e) => set("documents", car.documents.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
                <Select value={d.type} onChange={(e) => set("documents", car.documents.map((x, j) => (j === i ? { ...x, type: e.target.value as typeof d.type } : x)))} options={opts(DOC_TYPES, en.docType)} />
                <SingleUpload value={d.url} folder="documents" accept="application/pdf,image/*" label={t.common.file} onChange={(url) => set("documents", car.documents.map((x, j) => (j === i ? { ...x, url } : x)))} />
                <Button variant="ghost" size="icon" onClick={() => set("documents", car.documents.filter((_, j) => j !== i))} aria-label={e_.removeDocument}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => set("documents", [...car.documents, { title: "", url: "", type: "OTHER" }])}>
              <Plus className="size-4" /> {e_.addDocument}
            </Button>
          </div>
        </Panel>
      </div>

      <div className="space-y-6 xl:sticky xl:top-8 xl:self-start">
        <Panel title={e_.publishing}>
          <div className="space-y-4">
            <Field label={e_.listingType} hint={rent ? e_.rentHint : undefined}>
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-fg/[0.03] p-1" role="radiogroup" aria-label={e_.listingType}>
                {(["SALE", "RENT"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={car.listingType === v}
                    onClick={() => {
                      set("listingType", v);
                      if (v === "RENT" && (car.status === "SOLD" || car.status === "IN_TRANSIT")) set("status", "AVAILABLE");
                    }}
                    className={cn("h-9 rounded-lg text-sm transition-colors", car.listingType === v ? "bg-fg/10 text-fg" : "text-muted hover:text-fg")}
                  >
                    {v === "SALE" ? e_.listingSale : e_.listingRent}
                  </button>
                ))}
              </div>
            </Field>
            <Field label={rent ? e_.pricePerDay : e_.priceUsd}>
              <Input type="number" value={num(car.price)} onChange={(e) => set("price", Number(e.target.value))} className="text-lg font-medium" />
            </Field>
            {rent && (
              <div className="grid grid-cols-2 gap-3">
                <Field label={e_.deposit}>
                  <Input type="number" min={0} value={num(car.rentDeposit)} onChange={(e) => set("rentDeposit", e.target.value === "" ? null : Number(e.target.value))} />
                </Field>
                <Field label={e_.minDays}>
                  <Input type="number" min={1} max={365} value={num(car.rentMinDays)} onChange={(e) => set("rentMinDays", e.target.value === "" ? null : Number(e.target.value))} />
                </Field>
              </div>
            )}
            <Field label={t.common.status}>
              <Select value={car.status} onChange={(e) => set("status", e.target.value as CarAdminInput["status"])} options={opts(rent ? ["AVAILABLE", "RESERVED"] : ["AVAILABLE", "RESERVED", "IN_TRANSIT", "SOLD"], en.carStatus)} />
            </Field>
            <Field label={t.common.location}>
              <Input value={car.location} onChange={(e) => set("location", e.target.value)} />
            </Field>
            <Field label={e_.slug} hint={`/{locale}/cars/${car.slug || "…"}`}>
              <Input
                value={car.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
              />
            </Field>
            {[
              { k: "published" as const, label: e_.published, hint: e_.publishedHint },
              { k: "featured" as const, label: e_.featured, hint: e_.featuredHint },
            ].map(({ k, label, hint }) => (
              <label key={k} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
                <span>
                  <span className="block text-sm">{label}</span>
                  <span className="block text-xs text-subtle">{hint}</span>
                </span>
                <input type="checkbox" checked={car[k]} onChange={(e) => set(k, e.target.checked)} className="size-4 accent-[var(--color-accent)]" />
              </label>
            ))}
          </div>
          <div className="mt-5 grid gap-2">
            <Button onClick={save} loading={pending}>
              <Save className="size-4" /> {e_.save}
            </Button>
            {car.id && car.published && (
              <a href={`/${locale}/${rent ? "rent" : "cars"}/${car.slug}`} target="_blank" className={cn("inline-flex h-10 items-center justify-center gap-2 rounded-xl text-sm text-muted hover:text-fg")}>
                <ExternalLink className="size-4" /> {e_.viewOnSite}
              </a>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
