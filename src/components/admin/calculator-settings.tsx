"use client";

import { useState, type ReactNode } from "react";
import { Plus, Save, Trash2, FlaskConical } from "lucide-react";
import {
  saveRatesAction,
  saveAuctionAction,
  deleteAuctionAction,
  saveLookupAction,
  deleteLookupAction,
  saveShippingRatesAction,
  saveCustomsRuleAction,
  deleteCustomsRuleAction,
  saveFeeRuleAction,
  deleteFeeRuleAction,
} from "@/server/actions/admin/calculator";
import { Button } from "@/components/ui/button";
import { Chip, Input, Select } from "@/components/ui/field";
import { formatUsd } from "@/i18n/format";
import type { EstimateResult } from "@/server/calculator/engine";
import { cn } from "@/lib/cn";
import { Panel } from "./ui";
import { useAdminAction } from "./hooks";
import { ConfirmButton } from "./confirm-button";
import { useAdminT } from "./i18n";
import { fmt } from "@/i18n/format";

type Names = { hy: string; ru: string; en: string };
type Lookup = { id?: string; code: string; name: Names; active: boolean; sortOrder: number };
type Tier = { minPrice: number; maxPrice: number | null; fixedFee: number; percentFee: number };
type Auction = { id?: string; code: string; name: string; active: boolean; sortOrder: number; tiers: Tier[] };
type Rate = { originId: string; destinationId: string; vehicleTypeId: string; inlandTransport: number; oceanShipping: number; landDelivery: number };
type Customs = {
  id?: string;
  name: string;
  fuelTypes: string[];
  minAge: number;
  maxAge: number | null;
  minEngineCc: number;
  maxEngineCc: number | null;
  dutyPercent: number;
  dutyPerCcEur: number;
  exciseFixed: number;
  vatPercent: number;
  processingFee: number;
  priority: number;
  active: boolean;
  notes: string | null;
};
type Fee = { id?: string; key: string; name: Names; category: "DOCUMENTATION" | "REGISTRATION" | "SERVICE"; type: "FIXED" | "PERCENT"; basis: "CAR_PRICE" | "SUBTOTAL"; amount: number; minAmount: number | null; maxAmount: number | null; active: boolean; sortOrder: number };

export interface CalculatorSettingsData {
  rates: { code: string; perUsd: number }[];
  settings: { customsBaseIncludesShipping: boolean; referenceYear: number | null };
  auctions: Auction[];
  origins: Lookup[];
  destinations: Lookup[];
  vehicleTypes: Lookup[];
  shipping: Rate[];
  customs: Customs[];
  fees: Fee[];
}

const FUELS = ["GASOLINE", "DIESEL", "HYBRID", "PLUGIN_HYBRID", "ELECTRIC"];
const nullable = (v: string) => (v === "" ? null : Number(v));
const shown = (v: number | null) => (v === null ? "" : v);
const cell = "h-9 px-2.5 text-sm";

const TABS = ["rates", "auctions", "shipping", "customs", "fees", "lookups", "test"] as const;

export function CalculatorSettings({ data }: { data: CalculatorSettingsData }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("rates");
  const { t } = useAdminT();
  return (
    <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
      <nav className="no-scrollbar flex gap-1 overflow-x-auto lg:sticky lg:top-8 lg:flex-col lg:self-start">
        {TABS.map((id) => (
          <button key={id} onClick={() => setTab(id)} className={cn("shrink-0 rounded-lg px-3 py-2 text-left text-sm transition-colors", tab === id ? "bg-fg/[0.07] text-fg" : "text-muted hover:text-fg")}>
            {t.calculator.tabs[id]}
          </button>
        ))}
      </nav>
      <div className="min-w-0 space-y-6">
        {tab === "rates" && <RatesSection data={data} />}
        {tab === "auctions" && <AuctionsSection auctions={data.auctions} />}
        {tab === "shipping" && <ShippingSection data={data} />}
        {tab === "customs" && <CustomsSection rules={data.customs} />}
        {tab === "fees" && <FeesSection fees={data.fees} />}
        {tab === "lookups" && (
          <>
            <LookupSection kind="origin" title={t.calculator.lookups.origins} items={data.origins} />
            <LookupSection kind="destination" title={t.calculator.lookups.destinations} items={data.destinations} />
            <LookupSection kind="vehicleType" title={t.calculator.lookups.vehicleTypes} items={data.vehicleTypes} withActive={false} />
          </>
        )}
        {tab === "test" && <TestSection data={data} />}
      </div>
    </div>
  );
}

function SaveBar({ onSave, pending, children }: { onSave: () => void; pending: boolean; children?: ReactNode }) {
  const { t } = useAdminT();
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
      <div className="flex gap-2">{children}</div>
      <Button onClick={onSave} loading={pending} size="sm">
        <Save className="size-4" /> {t.common.saveChanges}
      </Button>
    </div>
  );
}

function RatesSection({ data }: { data: CalculatorSettingsData }) {
  const [rates, setRates] = useState(data.rates);
  const [settings, setSettings] = useState(data.settings);
  const { run, pending } = useAdminAction();
  const x = useAdminT().t.calculator.rates;
  return (
    <Panel title={x.title} description={x.hint}>
      <div className="space-y-2">
        {rates.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input className={cn(cell, "w-24 uppercase")} value={r.code} maxLength={3} onChange={(e) => setRates(rates.map((x, j) => (j === i ? { ...x, code: e.target.value.toUpperCase() } : x)))} />
            <span className="text-sm text-subtle">{x.perUsd}</span>
            <Input className={cn(cell, "w-40")} type="number" step="0.0001" value={r.perUsd} onChange={(e) => setRates(rates.map((x, j) => (j === i ? { ...x, perUsd: Number(e.target.value) } : x)))} />
            <Button variant="ghost" size="sm" onClick={() => setRates(rates.filter((_, j) => j !== i))} aria-label={x.remove}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3 text-sm">
          <span>
            {x.cif}
            <span className="block text-xs text-subtle">{x.cifHint}</span>
          </span>
          <input type="checkbox" checked={settings.customsBaseIncludesShipping} onChange={(e) => setSettings({ ...settings, customsBaseIncludesShipping: e.target.checked })} className="accent-[var(--color-accent)]" />
        </label>
        <label className="rounded-xl border border-line px-4 py-3 text-sm">
          {x.refYear}
          <span className="block text-xs text-subtle">{x.refYearHint}</span>
          <Input className={cn(cell, "mt-2")} type="number" value={shown(settings.referenceYear)} onChange={(e) => setSettings({ ...settings, referenceYear: nullable(e.target.value) })} />
        </label>
      </div>
      <SaveBar pending={pending} onSave={() => run(() => saveRatesAction({ rates, ...settings }), { success: x.savedToast })}>
        <Button variant="outline" size="sm" onClick={() => setRates([...rates, { code: "", perUsd: 1 }])}>
          <Plus className="size-4" /> {x.addCurrency}
        </Button>
      </SaveBar>
    </Panel>
  );
}

function AuctionsSection({ auctions: initial }: { auctions: Auction[] }) {
  const [auctions, setAuctions] = useState(initial);
  const { run, pending } = useAdminAction();
  const { t } = useAdminT();
  const x = t.calculator.auctions;
  const update = (i: number, patch: Partial<Auction>) => setAuctions(auctions.map((a, j) => (j === i ? { ...a, ...patch } : a)));
  return (
    <>
      {auctions.map((a, i) => (
        <Panel
          key={a.id ?? `new-${i}`}
          title={a.name || x.newAuction}
          description={x.hint}
          actions={
            <div className="flex items-center gap-2">
              <Input className={cn(cell, "w-28 uppercase")} placeholder={x.code} value={a.code} onChange={(e) => update(i, { code: e.target.value.toUpperCase() })} />
              <Input className={cn(cell, "w-36")} placeholder={x.displayName} value={a.name} onChange={(e) => update(i, { name: e.target.value })} />
              <label className="flex items-center gap-1.5 text-xs text-muted">
                <input type="checkbox" checked={a.active} onChange={(e) => update(i, { active: e.target.checked })} className="accent-[var(--color-accent)]" /> {t.common.active}
              </label>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-left text-xs text-subtle">
                <tr>
                  <th className="pb-2 font-normal">{x.minPrice}</th>
                  <th className="pb-2 font-normal">{x.maxPrice}</th>
                  <th className="pb-2 font-normal">{x.fixedFee}</th>
                  <th className="pb-2 font-normal">{x.percent}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {a.tiers.map((t, k) => (
                  <tr key={k}>
                    {(["minPrice", "maxPrice", "fixedFee", "percentFee"] as const).map((f) => (
                      <td key={f} className="py-1 pr-2">
                        <Input
                          className={cell}
                          type="number"
                          step="any"
                          value={shown(t[f])}
                          onChange={(e) => update(i, { tiers: a.tiers.map((x, m) => (m === k ? { ...x, [f]: f === "maxPrice" ? nullable(e.target.value) : Number(e.target.value) } : x)) })}
                        />
                      </td>
                    ))}
                    <td>
                      <Button variant="ghost" size="sm" onClick={() => update(i, { tiers: a.tiers.filter((_, m) => m !== k) })} aria-label={x.removeTier}>
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <SaveBar pending={pending} onSave={() => run(() => saveAuctionAction(a), { success: fmt(x.savedToast, { name: a.name }) })}>
            <Button variant="outline" size="sm" onClick={() => update(i, { tiers: [...a.tiers, { minPrice: (a.tiers.at(-1)?.maxPrice ?? 0) + 1, maxPrice: null, fixedFee: 0, percentFee: 0 }] })}>
              <Plus className="size-4" /> {x.addTier}
            </Button>
            {a.id && (
              <ConfirmButton title={fmt(x.deleteTitle, { name: a.name })} message={x.deleteMessage} onConfirm={() => run(() => deleteAuctionAction(a.id!), { success: t.common.deleted })}>
                <Trash2 className="size-4 text-danger" />
              </ConfirmButton>
            )}
          </SaveBar>
        </Panel>
      ))}
      <Button variant="outline" onClick={() => setAuctions([...auctions, { code: "", name: "", active: true, sortOrder: auctions.length, tiers: [{ minPrice: 0, maxPrice: null, fixedFee: 0, percentFee: 0 }] }])}>
        <Plus className="size-4" /> {x.add}
      </Button>
    </>
  );
}

function ShippingSection({ data }: { data: CalculatorSettingsData }) {
  const [rows, setRows] = useState<Rate[]>(() => {
    const out: Rate[] = [];
    for (const o of data.origins)
      for (const d of data.destinations)
        for (const v of data.vehicleTypes) {
          const r = data.shipping.find((s) => s.originId === o.id && s.destinationId === d.id && s.vehicleTypeId === v.id);
          out.push(r ?? { originId: o.id!, destinationId: d.id!, vehicleTypeId: v.id!, inlandTransport: 0, oceanShipping: 0, landDelivery: 0 });
        }
    return out;
  });
  const [origin, setOrigin] = useState(data.origins[0]?.id ?? "");
  const { run, pending } = useAdminAction();
  const { t, locale } = useAdminT();
  const x = t.calculator.shipping;
  const name = (list: Lookup[], id: string) => {
    const n = list.find((l) => l.id === id)?.name;
    return n?.[locale] || n?.en || "?";
  };
  const visible = rows.filter((r) => r.originId === origin);
  return (
    <Panel
      title={x.title}
      description={x.hint}
      actions={
        <div className="flex gap-1">
          {data.origins.map((o) => (
            <Chip key={o.id} active={o.id === origin} onClick={() => setOrigin(o.id!)} className="h-8">
              {o.name[locale] || o.name.en}
            </Chip>
          ))}
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-xs text-subtle">
            <tr>
              <th className="pb-2 font-normal">{x.destination}</th>
              <th className="pb-2 font-normal">{x.vehicleType}</th>
              <th className="pb-2 font-normal">{x.inland}</th>
              <th className="pb-2 font-normal">{x.ocean}</th>
              <th className="pb-2 font-normal">{x.land}</th>
              <th className="pb-2 text-right font-normal">{x.total}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const idx = rows.indexOf(r);
              return (
                <tr key={`${r.destinationId}-${r.vehicleTypeId}`} className="border-t border-line">
                  <td className="py-1.5 pr-2 text-muted">{name(data.destinations, r.destinationId)}</td>
                  <td className="py-1.5 pr-2">{name(data.vehicleTypes, r.vehicleTypeId)}</td>
                  {(["inlandTransport", "oceanShipping", "landDelivery"] as const).map((f) => (
                    <td key={f} className="py-1.5 pr-2">
                      <Input className={cell} type="number" value={r[f]} onChange={(e) => setRows(rows.map((x, j) => (j === idx ? { ...x, [f]: Number(e.target.value) } : x)))} />
                    </td>
                  ))}
                  <td className="py-1.5 text-right tabular">{formatUsd(r.inlandTransport + r.oceanShipping + r.landDelivery)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <SaveBar pending={pending} onSave={() => run(() => saveShippingRatesAction(rows), { success: x.savedToast })} />
    </Panel>
  );
}

function CustomsSection({ rules: initial }: { rules: Customs[] }) {
  const [rules, setRules] = useState(initial);
  const { run, pending } = useAdminAction();
  const { t } = useAdminT();
  const x = t.calculator.customs;
  const update = (i: number, patch: Partial<Customs>) => setRules(rules.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const numField = (i: number, r: Customs, f: keyof Customs, label: string, nullableField = false, step = "any") => (
    <label className="text-xs text-subtle">
      {label}
      <Input className={cn(cell, "mt-1")} type="number" step={step} value={shown(r[f] as number | null)} onChange={(e) => update(i, { [f]: nullableField ? nullable(e.target.value) : Number(e.target.value) } as Partial<Customs>)} />
    </label>
  );
  return (
    <>
      <p className="rounded-2xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning">
        {x.hint}
      </p>
      {rules.map((r, i) => (
        <Panel
          key={r.id ?? `new-${i}`}
          title={<Input className={cn(cell, "w-72 font-medium")} value={r.name} onChange={(e) => update(i, { name: e.target.value })} />}
          actions={
            <label className="flex items-center gap-1.5 text-xs text-muted">
              <input type="checkbox" checked={r.active} onChange={(e) => update(i, { active: e.target.checked })} className="accent-[var(--color-accent)]" /> {t.common.active}
            </label>
          }
        >
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs text-subtle">{x.fuel}</span>
            {FUELS.map((f) => (
              <Chip key={f} active={r.fuelTypes.includes(f)} className="h-7 px-2.5 text-xs" onClick={() => update(i, { fuelTypes: r.fuelTypes.includes(f) ? r.fuelTypes.filter((x) => x !== f) : [...r.fuelTypes, f] })}>
                {(t.enums.fuel as Record<string, string>)[f]}
              </Chip>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {numField(i, r, "priority", x.priority, false, "1")}
            {numField(i, r, "minAge", x.minAge, false, "1")}
            {numField(i, r, "maxAge", x.maxAge, true, "1")}
            {numField(i, r, "minEngineCc", x.minCc, false, "1")}
            {numField(i, r, "maxEngineCc", x.maxCc, true, "1")}
            {numField(i, r, "dutyPercent", x.dutyPercent)}
            {numField(i, r, "dutyPerCcEur", x.dutyPerCc)}
            {numField(i, r, "exciseFixed", x.excise)}
            {numField(i, r, "vatPercent", x.vat)}
            {numField(i, r, "processingFee", x.clearance)}
          </div>
          <Input className={cn(cell, "mt-3")} placeholder={x.notes} value={r.notes ?? ""} onChange={(e) => update(i, { notes: e.target.value })} />
          <SaveBar pending={pending} onSave={() => run(() => saveCustomsRuleAction(r as Parameters<typeof saveCustomsRuleAction>[0]), { success: x.savedToast })}>
            {r.id && (
              <ConfirmButton title={x.deleteTitle} onConfirm={() => run(() => deleteCustomsRuleAction(r.id!), { success: t.common.deleted })}>
                <Trash2 className="size-4 text-danger" />
              </ConfirmButton>
            )}
          </SaveBar>
        </Panel>
      ))}
      <Button
        variant="outline"
        onClick={() => setRules([...rules, { name: x.newRule, fuelTypes: [], minAge: 0, maxAge: null, minEngineCc: 0, maxEngineCc: null, dutyPercent: 15, dutyPerCcEur: 0, exciseFixed: 0, vatPercent: 20, processingFee: 0, priority: (rules.at(-1)?.priority ?? 0) + 10, active: true, notes: null }])}
      >
        <Plus className="size-4" /> {x.add}
      </Button>
    </>
  );
}

function FeesSection({ fees: initial }: { fees: Fee[] }) {
  const [fees, setFees] = useState(initial);
  const { run, pending } = useAdminAction();
  const { t, locale } = useAdminT();
  const x = t.calculator.fees;
  const update = (i: number, patch: Partial<Fee>) => setFees(fees.map((f, j) => (j === i ? { ...f, ...patch } : f)));
  return (
    <>
      {fees.map((f, i) => (
        <Panel
          key={f.id ?? `new-${i}`}
          title={f.name[locale] || f.name.en || f.key || x.newFee}
          description={fmt(x.hint, { category: t.enums.feeCategory[f.category] })}
          actions={
            <label className="flex items-center gap-1.5 text-xs text-muted">
              <input type="checkbox" checked={f.active} onChange={(e) => update(i, { active: e.target.checked })} className="accent-[var(--color-accent)]" /> {t.common.active}
            </label>
          }
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <label className="text-xs text-subtle">
              {x.key}
              <Input className={cn(cell, "mt-1")} value={f.key} onChange={(e) => update(i, { key: e.target.value.toLowerCase() })} />
            </label>
            <label className="text-xs text-subtle">
              {x.category}
              <Select className={cn(cell, "mt-1")} value={f.category} onChange={(e) => update(i, { category: e.target.value as Fee["category"] })} options={(["DOCUMENTATION", "REGISTRATION", "SERVICE"] as const).map((v) => ({ value: v, label: t.enums.feeCategory[v] }))} />
            </label>
            <label className="text-xs text-subtle">
              {x.type}
              <Select className={cn(cell, "mt-1")} value={f.type} onChange={(e) => update(i, { type: e.target.value as Fee["type"] })} options={[{ value: "FIXED", label: x.fixed }, { value: "PERCENT", label: x.percent }]} />
            </label>
            <label className="text-xs text-subtle">
              {x.percentOf}
              <Select className={cn(cell, "mt-1")} disabled={f.type === "FIXED"} value={f.basis} onChange={(e) => update(i, { basis: e.target.value as Fee["basis"] })} options={[{ value: "CAR_PRICE", label: x.carPrice }, { value: "SUBTOTAL", label: x.subtotal }]} />
            </label>
            <label className="text-xs text-subtle">
              {x.amount} {f.type === "PERCENT" ? "%" : "$"}
              <Input className={cn(cell, "mt-1")} type="number" step="any" value={f.amount} onChange={(e) => update(i, { amount: Number(e.target.value) })} />
            </label>
            <label className="text-xs text-subtle">
              {x.minimum}
              <Input className={cn(cell, "mt-1")} type="number" value={shown(f.minAmount)} onChange={(e) => update(i, { minAmount: nullable(e.target.value) })} />
            </label>
            <label className="text-xs text-subtle">
              {x.maximum}
              <Input className={cn(cell, "mt-1")} type="number" value={shown(f.maxAmount)} onChange={(e) => update(i, { maxAmount: nullable(e.target.value) })} />
            </label>
            <label className="text-xs text-subtle">
              {x.order}
              <Input className={cn(cell, "mt-1")} type="number" value={f.sortOrder} onChange={(e) => update(i, { sortOrder: Number(e.target.value) })} />
            </label>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {(["hy", "ru", "en"] as const).map((l) => (
              <Input key={l} className={cell} placeholder={fmt(x.name, { lang: l })} value={f.name[l]} onChange={(e) => update(i, { name: { ...f.name, [l]: e.target.value } })} />
            ))}
          </div>
          <SaveBar pending={pending} onSave={() => run(() => saveFeeRuleAction(f), { success: x.savedToast })}>
            {f.id && (
              <ConfirmButton title={x.deleteTitle} onConfirm={() => run(() => deleteFeeRuleAction(f.id!), { success: t.common.deleted })}>
                <Trash2 className="size-4 text-danger" />
              </ConfirmButton>
            )}
          </SaveBar>
        </Panel>
      ))}
      <Button variant="outline" onClick={() => setFees([...fees, { key: "", name: { hy: "", ru: "", en: "" }, category: "DOCUMENTATION", type: "FIXED", basis: "CAR_PRICE", amount: 0, minAmount: null, maxAmount: null, active: true, sortOrder: fees.length + 1 }])}>
        <Plus className="size-4" /> {x.add}
      </Button>
    </>
  );
}

function LookupSection({ kind, title, items: initial, withActive = true }: { kind: "origin" | "destination" | "vehicleType"; title: string; items: Lookup[]; withActive?: boolean }) {
  const [items, setItems] = useState(initial);
  const { run, pending } = useAdminAction();
  const { t } = useAdminT();
  const x = t.calculator.lookups;
  const update = (i: number, patch: Partial<Lookup>) => setItems(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <Panel title={title} description={x.hint}>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={it.id ?? `n${i}`} className="grid items-center gap-2 sm:grid-cols-[110px_1fr_1fr_1fr_60px_auto]">
            <Input className={cn(cell, "uppercase")} placeholder={t.calculator.auctions.code} value={it.code} onChange={(e) => update(i, { code: e.target.value.toUpperCase() })} />
            {(["hy", "ru", "en"] as const).map((l) => (
              <Input key={l} className={cell} placeholder={l} value={it.name[l]} onChange={(e) => update(i, { name: { ...it.name, [l]: e.target.value } })} />
            ))}
            <Input className={cell} type="number" title={x.sortOrder} value={it.sortOrder} onChange={(e) => update(i, { sortOrder: Number(e.target.value) })} />
            <div className="flex items-center gap-1">
              {withActive && <input type="checkbox" title={t.common.active} checked={it.active} onChange={(e) => update(i, { active: e.target.checked })} className="mx-1 accent-[var(--color-accent)]" />}
              <Button variant="ghost" size="sm" disabled={pending} onClick={() => run(() => saveLookupAction(kind, it), { success: t.common.saved })} aria-label={t.common.save}>
                <Save className="size-4" />
              </Button>
              {it.id ? (
                <ConfirmButton title={x.deleteTitle} message={x.deleteMessage} onConfirm={() => run(() => deleteLookupAction(kind, it.id!), { success: t.common.deleted })}>
                  <Trash2 className="size-4 text-danger" />
                </ConfirmButton>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setItems(items.filter((_, j) => j !== i))}>
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" className="mt-4" onClick={() => setItems([...items, { code: "", name: { hy: "", ru: "", en: "" }, active: true, sortOrder: items.length + 1 }])}>
        <Plus className="size-4" /> {t.common.add}
      </Button>
    </Panel>
  );
}

function TestSection({ data }: { data: CalculatorSettingsData }) {
  const [input, setInput] = useState({
    auction: data.auctions[0]?.code ?? "",
    price: 12000,
    year: new Date().getFullYear() - 4,
    engine: 2.5,
    fuel: "GASOLINE",
    vehicleType: data.vehicleTypes[0]?.code ?? "",
    origin: data.origins[0]?.code ?? "",
    destination: data.destinations[0]?.code ?? "",
  });
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { t, locale } = useAdminT();
  const x = t.calculator.test;
  const nm = (n: Names) => n[locale] || n.en;
  async function runTest() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/calculator/estimate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    const json = await res.json();
    if (res.ok) setResult(json);
    else setError(json?.error?.code ?? x.error);
    setBusy(false);
  }
  return (
    <Panel title={x.title} description={x.hint}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Select className={cell} value={input.auction} onChange={(e) => setInput({ ...input, auction: e.target.value })} options={data.auctions.map((a) => ({ value: a.code, label: a.name }))} />
        <Input className={cell} type="number" value={input.price} onChange={(e) => setInput({ ...input, price: Number(e.target.value) })} aria-label={t.common.price} />
        <Input className={cell} type="number" value={input.year} onChange={(e) => setInput({ ...input, year: Number(e.target.value) })} aria-label={t.common.year} />
        <Input className={cell} type="number" step={0.1} value={input.engine} onChange={(e) => setInput({ ...input, engine: Number(e.target.value) })} aria-label={x.engine} />
        <Select className={cell} value={input.fuel} onChange={(e) => setInput({ ...input, fuel: e.target.value })} options={FUELS.map((f) => ({ value: f, label: (t.enums.fuel as Record<string, string>)[f] }))} />
        <Select className={cell} value={input.vehicleType} onChange={(e) => setInput({ ...input, vehicleType: e.target.value })} options={data.vehicleTypes.map((v) => ({ value: v.code, label: nm(v.name) }))} />
        <Select className={cell} value={input.origin} onChange={(e) => setInput({ ...input, origin: e.target.value })} options={data.origins.map((v) => ({ value: v.code, label: nm(v.name) }))} />
        <Select className={cell} value={input.destination} onChange={(e) => setInput({ ...input, destination: e.target.value })} options={data.destinations.map((v) => ({ value: v.code, label: nm(v.name) }))} />
      </div>
      <Button className="mt-4" size="sm" onClick={runTest} loading={busy}>
        <FlaskConical className="size-4" /> {x.run}
      </Button>
      {error && <p className="mt-4 text-sm text-danger">{error}</p>}
      {result && (
        <div className="mt-5 rounded-xl border border-line p-4 text-sm">
          <p className="mb-3 text-xs text-subtle">
            {x.rule} <span className="text-fg">{result.customsRule}</span> · {fmt(x.age, { age: result.vehicleAge })} · {fmt(x.amdRate, { rate: result.amdRate ?? "—" })}
          </p>
          <ul className="divide-y divide-line">
            {result.lines.map((l) => (
              <li key={l.key} className="flex justify-between py-1.5">
                <span className="text-muted">
                  {l.key}
                  {l.detail && <span className="ml-2 text-xs text-subtle">({l.detail.map((d) => `${d.key} ${formatUsd(d.amount)}`).join(", ")})</span>}
                </span>
                <span className="tabular">{formatUsd(l.amount)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between border-t border-line pt-3 font-medium">
            {x.total} <span className="tabular text-positive">{formatUsd(result.total)}</span>
          </p>
        </div>
      )}
    </Panel>
  );
}
