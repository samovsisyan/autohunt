"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, Calculator, Trash2, FileText, Plus, Check, Circle, Dot } from "lucide-react";
import type { ImportAdminInput } from "@/server/validation/admin";
import { saveImportAction, deleteImportAction, addImportDocumentAction, deleteDocumentAction } from "@/server/actions/admin/imports";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { formatUsd } from "@/i18n/format";
import { cn } from "@/lib/cn";
import { Panel } from "./ui";
import { useAdminAction } from "./hooks";
import { ConfirmButton } from "./confirm-button";
import { SingleUpload } from "./image-uploader";

type Stage = ImportAdminInput["events"][number]["stage"];
const STAGES: Stage[] = ["AUCTION", "PURCHASED", "PICKED_UP", "AT_PORT", "SHIPPING", "ARRIVED", "CUSTOMS", "REGISTRATION", "READY"];
const label = (s: string) => s.replace("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
const num = (v: unknown) => (v === null || v === undefined ? "" : (v as number | string));

export interface ImportEditorProps {
  initial: ImportAdminInput;
  customers: { id: string; name: string; email: string }[];
  cars: { id: string; title: string }[];
  auctions: { id: string; code: string; name: string }[];
  destinations: { value: string; label: string }[];
  vehicleTypes: { value: string; label: string }[];
  documents?: { id: string; title: string; url: string; type: string }[];
}

export function ImportEditor({ initial, customers, cars, auctions, destinations, vehicleTypes, documents = [] }: ImportEditorProps) {
  const router = useRouter();
  const [imp, setImp] = useState<ImportAdminInput>(initial);
  const [calc, setCalc] = useState({ engine: "2.5", fuel: "GASOLINE", vehicleType: vehicleTypes[0]?.value ?? "SEDAN", destination: destinations[0]?.value ?? "GYUMRI" });
  const [calcBusy, setCalcBusy] = useState(false);
  const [doc, setDoc] = useState({ title: "", url: "", type: "INVOICE" });
  const { run, pending } = useAdminAction();

  const set = <K extends keyof ImportAdminInput>(k: K, v: ImportAdminInput[K]) => setImp((p) => ({ ...p, [k]: v }));
  const event = (stage: Stage) => imp.events.find((e) => e.stage === stage) ?? { stage, status: "PENDING" as const, date: "", location: "", note: "" };
  const setEvent = (stage: Stage, patch: Partial<ImportAdminInput["events"][number]>) =>
    setImp((p) => ({ ...p, events: STAGES.map((s) => (s === stage ? { ...event(s), ...patch } : p.events.find((e) => e.stage === s) ?? event(s))) }));

  /** Make the chosen stage current: everything before is done, after is pending. */
  const moveTo = (stage: Stage) => {
    const idx = STAGES.indexOf(stage);
    const today = new Date().toISOString().slice(0, 10);
    setImp((p) => ({
      ...p,
      currentStage: stage,
      events: STAGES.map((s, i) => {
        const e = p.events.find((x) => x.stage === s) ?? event(s);
        const status = stage === "READY" ? "DONE" : i < idx ? "DONE" : i === idx ? "CURRENT" : "PENDING";
        return { ...e, status, date: e.date || (i <= idx ? today : "") };
      }),
    }));
  };

  async function estimate() {
    const auction = auctions.find((a) => a.id === imp.auctionId);
    if (!auction) return toast("Select an auction first", "error");
    setCalcBusy(true);
    try {
      const res = await fetch("/api/calculator/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auction: auction.code, price: imp.purchasePrice, year: imp.vehicleYear, engine: calc.fuel === "ELECTRIC" ? 0 : Number(calc.engine), fuel: calc.fuel, vehicleType: calc.vehicleType, origin: "US", destination: calc.destination }),
      });
      if (!res.ok) throw new Error("Estimate failed — check calculator rules");
      const result = await res.json();
      setImp((p) => ({ ...p, estimatedTotal: result.total, breakdown: result }));
      toast(`Estimated total: ${formatUsd(result.total)}`);
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setCalcBusy(false);
    }
  }

  const save = () =>
    run(() => saveImportAction(imp), {
      success: "Import saved",
      onSuccess: (d) => {
        if (!imp.id && d?.id) router.replace(`/admin/imports/${d.id}`);
      },
    });

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <Panel title="Vehicle & customer">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Import code">
              <Input value={imp.code} onChange={(e) => set("code", e.target.value)} />
            </Field>
            <Field label="Customer" className="lg:col-span-2">
              <Select value={imp.customerId} onChange={(e) => set("customerId", e.target.value)} placeholder="Select customer…" options={customers.map((c) => ({ value: c.id, label: `${c.name} — ${c.email}` }))} />
            </Field>
            <Field label="Vehicle title">
              <Input value={imp.vehicleTitle} onChange={(e) => set("vehicleTitle", e.target.value)} placeholder="Toyota Camry SE" />
            </Field>
            <Field label="Year">
              <Input type="number" value={num(imp.vehicleYear)} onChange={(e) => set("vehicleYear", Number(e.target.value))} />
            </Field>
            <Field label="Linked listing (optional)">
              <Select value={imp.carId ?? ""} onChange={(e) => set("carId", e.target.value || null)} placeholder="—" options={cars.map((c) => ({ value: c.id, label: c.title }))} />
            </Field>
            <Field label="Auction">
              <Select value={imp.auctionId ?? ""} onChange={(e) => set("auctionId", e.target.value || null)} placeholder="—" options={auctions.map((a) => ({ value: a.id, label: a.name }))} />
            </Field>
            <Field label="Lot number">
              <Input value={imp.lotNumber ?? ""} onChange={(e) => set("lotNumber", e.target.value)} />
            </Field>
            <Field label="VIN">
              <Input value={imp.vin ?? ""} maxLength={17} onChange={(e) => set("vin", e.target.value.toUpperCase())} />
            </Field>
            <Field label="Photo" className="sm:col-span-2 lg:col-span-3">
              <SingleUpload value={imp.imageUrl ?? ""} folder="imports" onChange={(v) => set("imageUrl", v)} />
            </Field>
            <Field label="Internal notes" className="sm:col-span-2 lg:col-span-3">
              <Textarea rows={2} value={imp.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
            </Field>
          </div>
        </Panel>

        <Panel title="Tracking timeline" description="Click a stage to make it current. Dates, locations and notes are visible to the customer.">
          <ol className="space-y-3">
            {STAGES.map((stage) => {
              const e = event(stage);
              return (
                <li key={stage} className={cn("rounded-xl border p-3", e.status === "CURRENT" ? "border-accent/50 bg-accent-soft" : "border-line")}>
                  <div className="flex flex-wrap items-center gap-3">
                    <button type="button" onClick={() => moveTo(stage)} className="inline-flex min-w-40 items-center gap-2 text-sm font-medium hover:text-accent" title="Set as current stage">
                      <span className={cn("grid size-6 place-items-center rounded-full border", e.status === "DONE" ? "border-positive/40 bg-positive-soft text-positive" : e.status === "CURRENT" ? "border-accent bg-accent text-bg" : "border-line-strong text-subtle")}>
                        {e.status === "DONE" ? <Check className="size-3.5" /> : e.status === "CURRENT" ? <Dot className="size-5" /> : <Circle className="size-2" />}
                      </span>
                      {label(stage)}
                    </button>
                    <Select className="h-9 w-32 text-sm" value={e.status} onChange={(ev) => setEvent(stage, { status: ev.target.value as "DONE" })} options={["DONE", "CURRENT", "PENDING"].map((s) => ({ value: s, label: s.toLowerCase() }))} />
                    <Input type="date" className="h-9 w-40 text-sm" value={(e.date ?? "").slice(0, 10)} onChange={(ev) => setEvent(stage, { date: ev.target.value })} />
                    <Input className="h-9 min-w-40 flex-1 text-sm" placeholder="Location" value={e.location ?? ""} onChange={(ev) => setEvent(stage, { location: ev.target.value })} />
                  </div>
                  {e.status !== "PENDING" && <Input className="mt-2 h-9 text-sm" placeholder="Note for the customer (optional)" value={e.note ?? ""} onChange={(ev) => setEvent(stage, { note: ev.target.value })} />}
                </li>
              );
            })}
          </ol>
        </Panel>

        {imp.id && (
          <Panel title="Customer documents" description="Uploaded files appear in the customer's dashboard and trigger a notification.">
            <ul className="mb-4 divide-y divide-line">
              {documents.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <a href={d.url} target="_blank" className="inline-flex items-center gap-2 hover:text-accent">
                    <FileText className="size-4 text-subtle" /> {d.title} <span className="text-xs text-subtle">· {label(d.type)}</span>
                  </a>
                  <Button variant="ghost" size="sm" onClick={() => run(() => deleteDocumentAction(d.id), { success: "Document removed" })} aria-label="Remove">
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
              {!documents.length && <li className="py-2 text-sm text-muted">No documents yet.</li>}
            </ul>
            <div className="grid gap-2 sm:grid-cols-[1fr_170px]">
              <Input placeholder="Document title" value={doc.title} onChange={(e) => setDoc({ ...doc, title: e.target.value })} />
              <Select value={doc.type} onChange={(e) => setDoc({ ...doc, type: e.target.value })} options={["INVOICE", "BILL_OF_SALE", "TITLE", "BILL_OF_LADING", "CUSTOMS", "REGISTRATION", "INSPECTION", "VEHICLE_HISTORY", "OTHER"].map((t) => ({ value: t, label: label(t) }))} />
              <div className="sm:col-span-2">
                <SingleUpload value={doc.url} folder="documents" accept="application/pdf,image/*" label="Choose file" onChange={(url) => setDoc({ ...doc, url })} />
              </div>
            </div>
            <Button className="mt-3" variant="outline" size="sm" disabled={pending} onClick={() => run(() => addImportDocumentAction(imp.id!, doc), { success: "Document added", onSuccess: () => setDoc({ title: "", url: "", type: "INVOICE" }) })}>
              <Plus className="size-4" /> Add document
            </Button>
          </Panel>
        )}
      </div>

      <div className="space-y-6 xl:sticky xl:top-8 xl:self-start">
        <Panel title="Financials">
          <div className="space-y-4">
            <Field label="Purchase price (bid), USD">
              <Input type="number" value={num(imp.purchasePrice)} onChange={(e) => set("purchasePrice", Number(e.target.value))} />
            </Field>
            <div className="rounded-xl border border-line p-3">
              <p className="mb-2 text-xs text-subtle">Estimate with the live calculator rules</p>
              <div className="grid grid-cols-2 gap-2">
                <Input className="h-9 text-sm" type="number" step={0.1} value={calc.engine} onChange={(e) => setCalc({ ...calc, engine: e.target.value })} placeholder="Engine L" aria-label="Engine" />
                <Select className="h-9 text-sm" value={calc.fuel} onChange={(e) => setCalc({ ...calc, fuel: e.target.value })} options={["GASOLINE", "DIESEL", "HYBRID", "PLUGIN_HYBRID", "ELECTRIC"].map((f) => ({ value: f, label: label(f) }))} />
                <Select className="h-9 text-sm" value={calc.vehicleType} onChange={(e) => setCalc({ ...calc, vehicleType: e.target.value })} options={vehicleTypes} />
                <Select className="h-9 text-sm" value={calc.destination} onChange={(e) => setCalc({ ...calc, destination: e.target.value })} options={destinations} />
              </div>
              <Button variant="outline" size="sm" className="mt-2 w-full" onClick={estimate} loading={calcBusy}>
                <Calculator className="size-4" /> Calculate & apply
              </Button>
            </div>
            <Field label="Estimated total, USD">
              <Input type="number" value={num(imp.estimatedTotal)} onChange={(e) => set("estimatedTotal", Number(e.target.value))} />
            </Field>
            <Field label="Final total, USD" hint="Set after the official customs assessment">
              <Input type="number" value={num(imp.finalTotal)} onChange={(e) => set("finalTotal", e.target.value === "" ? null : Number(e.target.value))} />
            </Field>
            <Field label="Paid by customer, USD">
              <Input type="number" value={num(imp.paidAmount)} onChange={(e) => set("paidAmount", Number(e.target.value))} />
            </Field>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={imp.notifyCustomer ?? true} onChange={(e) => set("notifyCustomer", e.target.checked)} className="accent-[var(--color-accent)]" />
              Notify customer on stage change
            </label>
          </div>
          <div className="mt-5 grid gap-2">
            <Button onClick={save} loading={pending}>
              <Save className="size-4" /> Save import
            </Button>
            {imp.id && (
              <ConfirmButton title="Delete import?" message="The import, its timeline and linked documents will be removed." onConfirm={() => run(() => deleteImportAction(imp.id!), { success: "Import deleted", onSuccess: () => router.replace("/admin/imports") })}>
                <Trash2 className="size-4 text-danger" /> Delete
              </ConfirmButton>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
