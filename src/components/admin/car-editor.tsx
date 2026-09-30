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

const opts = (xs: string[]) => xs.map((x) => ({ value: x, label: x.replace("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) }));
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
  price: 0,
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

export function CarEditor({ initial }: { initial: CarAdminInput }) {
  const router = useRouter();
  const [car, setCar] = useState<CarAdminInput>(initial);
  const [tab, setTab] = useState<"hy" | "ru" | "en">("hy");
  const [slugTouched, setSlugTouched] = useState(!!initial.id);
  const { run, pending } = useAdminAction();

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
      success: "Car saved",
      onSuccess: (d) => {
        if (!car.id && d?.id) router.replace(`/admin/cars/${d.id}`);
      },
    });

  const tr = car.translations[tab] ?? { description: "" };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Panel title="Vehicle">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Brand">
              <Input value={car.brand} onChange={(e) => set("brand", e.target.value)} />
            </Field>
            <Field label="Model">
              <Input value={car.model} onChange={(e) => set("model", e.target.value)} />
            </Field>
            <Field label="Trim">
              <Input value={car.trim ?? ""} onChange={(e) => set("trim", e.target.value)} />
            </Field>
            <Field label="Year">
              <Input type="number" value={num(car.year)} onChange={(e) => set("year", Number(e.target.value))} />
            </Field>
            <Field label="Mileage">
              <div className="flex gap-2">
                <Input type="number" value={num(car.mileage)} onChange={(e) => set("mileage", Number(e.target.value))} />
                <Select className="w-24" value={car.mileageUnit} onChange={(e) => set("mileageUnit", e.target.value as "MI" | "KM")} options={[{ value: "MI", label: "mi" }, { value: "KM", label: "km" }]} />
              </div>
            </Field>
            <Field label="Engine, L (empty for EV)">
              <Input type="number" step={0.1} value={num(car.engineVolume)} onChange={(e) => set("engineVolume", e.target.value === "" ? null : Number(e.target.value))} />
            </Field>
            <Field label="Horsepower">
              <Input type="number" value={num(car.horsepower)} onChange={(e) => set("horsepower", e.target.value === "" ? null : Number(e.target.value))} />
            </Field>
            <Field label="Fuel">
              <Select value={car.fuel} onChange={(e) => set("fuel", e.target.value as CarAdminInput["fuel"])} options={opts(["GASOLINE", "DIESEL", "HYBRID", "PLUGIN_HYBRID", "ELECTRIC"])} />
            </Field>
            <Field label="Transmission">
              <Select value={car.transmission} onChange={(e) => set("transmission", e.target.value as CarAdminInput["transmission"])} options={opts(["AUTOMATIC", "MANUAL", "CVT", "ROBOTIC"])} />
            </Field>
            <Field label="Drive">
              <Select value={car.drive} onChange={(e) => set("drive", e.target.value as CarAdminInput["drive"])} options={opts(["FWD", "RWD", "AWD", "FOUR_WD"])} />
            </Field>
            <Field label="Body type">
              <Select value={car.bodyType} onChange={(e) => set("bodyType", e.target.value as CarAdminInput["bodyType"])} options={opts(["SEDAN", "SUV", "CROSSOVER", "HATCHBACK", "COUPE", "WAGON", "PICKUP", "MINIVAN", "CONVERTIBLE"])} />
            </Field>
            <Field label="VIN">
              <Input value={car.vin ?? ""} onChange={(e) => set("vin", e.target.value.toUpperCase())} maxLength={17} />
            </Field>
            <Field label="Exterior color">
              <Input value={car.color ?? ""} onChange={(e) => set("color", e.target.value)} />
            </Field>
            <Field label="Interior">
              <Input value={car.interior ?? ""} onChange={(e) => set("interior", e.target.value)} />
            </Field>
            <Field label="Source">
              <Input value={car.source ?? ""} onChange={(e) => set("source", e.target.value)} placeholder="Copart / IAAI / Local" />
            </Field>
          </div>
          <Field label="Features (one per line)" className="mt-4">
            <Textarea rows={4} value={car.features.join("\n")} onChange={(e) => set("features", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} />
          </Field>
        </Panel>

        <Panel title="Gallery" description="First image is the cover. Uploaded to cloud storage when STORAGE_DRIVER=s3.">
          <GalleryUploader value={car.images.map((i) => ({ url: i.url, alt: i.alt ?? null }))} onChange={(v) => set("images", v)} />
        </Panel>

        <Panel
          title="Description & SEO"
          actions={
            <div className="flex gap-1">
              {LOCALES.map((l) => (
                <Chip key={l.id} active={tab === l.id} onClick={() => setTab(l.id)} className="h-8">
                  {l.label}
                  {!car.translations[l.id]?.description && <span className="size-1.5 rounded-full bg-warning" title="Missing" />}
                </Chip>
              ))}
            </div>
          }
        >
          <div className="space-y-4">
            <Field label="Description">
              <Textarea rows={8} value={tr.description ?? ""} onChange={(e) => setT("description", e.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="SEO title" hint={`${(tr.seoTitle ?? "").length}/60 recommended`}>
                <Input value={tr.seoTitle ?? ""} onChange={(e) => setT("seoTitle", e.target.value)} />
              </Field>
              <Field label="SEO description" hint={`${(tr.seoDescription ?? "").length}/160 recommended`}>
                <Input value={tr.seoDescription ?? ""} onChange={(e) => setT("seoDescription", e.target.value)} />
              </Field>
            </div>
          </div>
        </Panel>

        <Panel title="History & documents">
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {(["owners", "accidents", "serviceRecords"] as const).map((k) => (
              <Field key={k} label={k.replace(/([A-Z])/g, " $1").replace(/^\w/, (c) => c.toUpperCase())}>
                <Input type="number" value={num(car.history[k])} onChange={(e) => set("history", { ...car.history, [k]: e.target.value === "" ? null : Number(e.target.value) })} />
              </Field>
            ))}
            <Field label="Title status">
              <Input value={car.history.titleStatus ?? ""} onChange={(e) => set("history", { ...car.history, titleStatus: e.target.value })} />
            </Field>
            <Field label="Lot number">
              <Input value={car.history.lotNumber ?? ""} onChange={(e) => set("history", { ...car.history, lotNumber: e.target.value })} />
            </Field>
          </div>
          <div className="mt-6 space-y-3">
            {car.documents.map((d, i) => (
              <div key={i} className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-[1fr_180px_2fr_auto]">
                <Input value={d.title} placeholder="Title" onChange={(e) => set("documents", car.documents.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
                <Select value={d.type} onChange={(e) => set("documents", car.documents.map((x, j) => (j === i ? { ...x, type: e.target.value as typeof d.type } : x)))} options={opts(DOC_TYPES)} />
                <SingleUpload value={d.url} folder="documents" accept="application/pdf,image/*" label="File" onChange={(url) => set("documents", car.documents.map((x, j) => (j === i ? { ...x, url } : x)))} />
                <Button variant="ghost" size="icon" onClick={() => set("documents", car.documents.filter((_, j) => j !== i))} aria-label="Remove document">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => set("documents", [...car.documents, { title: "", url: "", type: "OTHER" }])}>
              <Plus className="size-4" /> Add document
            </Button>
          </div>
        </Panel>
      </div>

      <div className="space-y-6 xl:sticky xl:top-8 xl:self-start">
        <Panel title="Publishing">
          <div className="space-y-4">
            <Field label="Price, USD">
              <Input type="number" value={num(car.price)} onChange={(e) => set("price", Number(e.target.value))} className="text-lg font-medium" />
            </Field>
            <Field label="Status">
              <Select value={car.status} onChange={(e) => set("status", e.target.value as CarAdminInput["status"])} options={opts(["AVAILABLE", "RESERVED", "IN_TRANSIT", "SOLD"])} />
            </Field>
            <Field label="Location">
              <Input value={car.location} onChange={(e) => set("location", e.target.value)} />
            </Field>
            <Field label="URL slug" hint={`/{locale}/cars/${car.slug || "…"}`}>
              <Input
                value={car.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
              />
            </Field>
            {[
              { k: "published" as const, label: "Published", hint: "Visible on the website" },
              { k: "featured" as const, label: "Featured", hint: "Shown first on the homepage" },
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
              <Save className="size-4" /> Save car
            </Button>
            {car.id && car.published && (
              <a href={`/en/cars/${car.slug}`} target="_blank" className={cn("inline-flex h-10 items-center justify-center gap-2 rounded-xl text-sm text-muted hover:text-fg")}>
                <ExternalLink className="size-4" /> View on site
              </a>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
