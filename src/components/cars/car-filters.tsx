"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { SlidersHorizontal, Search, X, Loader2 } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { CarFacets } from "@/server/services/car.service";
import { Chip, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/overlay";
import { cn } from "@/lib/cn";

type Labels = {
  cars: Dictionary["cars"];
  enums: Dictionary["enums"];
  common: Dictionary["common"];
};

const MULTI = ["brand", "fuel", "transmission", "body", "drive", "location"] as const;
const FILTER_KEYS = [...MULTI, "q", "model", "yearMin", "yearMax", "priceMin", "priceMax", "mileageMax", "engineMin", "engineMax"];

function useFilterParams() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  const update = (mutate: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    next.delete("page");
    start(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };
  const list = (key: string) => (params.get(key) ?? "").split(",").filter(Boolean);
  const toggle = (key: string, value: string) =>
    update((p) => {
      const cur = (p.get(key) ?? "").split(",").filter(Boolean);
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      if (next.length) p.set(key, next.join(","));
      else p.delete(key);
    });
  const set = (key: string, value: string) =>
    update((p) => {
      if (value) p.set(key, value);
      else p.delete(key);
    });
  const clear = () => update((p) => FILTER_KEYS.forEach((k) => p.delete(k)));
  const activeCount = FILTER_KEYS.filter((k) => params.get(k)).length;
  return { params, list, toggle, set, clear, pending, activeCount };
}

/** Number input that commits to the URL after the user pauses typing. */
function DebouncedInput({ value, onCommit, ...props }: { value: string; onCommit: (v: string) => void } & Omit<React.ComponentProps<"input">, "value" | "onChange">) {
  const [local, setLocal] = useState(value);
  const [synced, setSynced] = useState(value);
  if (synced !== value) {
    setSynced(value);
    setLocal(value);
  }
  useEffect(() => {
    if (local === value) return;
    const t = setTimeout(() => onCommit(local), 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);
  return <Input {...props} value={local} onChange={(e) => setLocal(e.target.value)} className={cn("h-11", props.className)} />;
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-b border-line py-5 first:pt-0 last:border-0">
      <legend className="mb-3 text-[0.8125rem] font-medium text-fg">{title}</legend>
      {children}
    </fieldset>
  );
}

function FilterFields({ facets, t }: { facets: CarFacets; t: Labels }) {
  const f = useFilterParams();
  const brands = f.list("brand");
  const models = facets.models.filter((m) => brands.length === 0 || brands.includes(m.brand));
  const range = (minKey: string, maxKey: string, ph: [string, string], step = 1) => (
    <div className="grid grid-cols-2 gap-2">
      <DebouncedInput type="number" inputMode="numeric" step={step} placeholder={ph[0]} aria-label={`${t.common.min}`} value={f.params.get(minKey) ?? ""} onCommit={(v) => f.set(minKey, v)} />
      <DebouncedInput type="number" inputMode="numeric" step={step} placeholder={ph[1]} aria-label={`${t.common.max}`} value={f.params.get(maxKey) ?? ""} onCommit={(v) => f.set(maxKey, v)} />
    </div>
  );
  const chips = (key: string, entries: [string, string][]) => (
    <div className="flex flex-wrap gap-2">
      {entries.map(([value, label]) => (
        <Chip key={value} active={f.list(key).includes(value)} onClick={() => f.toggle(key, value)} className="h-8 px-3 text-[0.8125rem]">
          {label}
        </Chip>
      ))}
    </div>
  );

  return (
    <div>
      <Group title={t.cars.filter.brand}>{chips("brand", facets.brands.map((b) => [b.value, `${b.value} · ${b.count}`]))}</Group>
      <Group title={t.cars.filter.model}>
        <Select
          value={f.params.get("model") ?? ""}
          onChange={(e) => f.set("model", e.target.value)}
          placeholder={t.common.any}
          options={[...new Set(models.map((m) => m.model))].map((m) => ({ value: m, label: m }))}
          className="h-11"
        />
      </Group>
      <Group title={t.cars.filter.price}>{range("priceMin", "priceMax", [`${t.common.from} ${facets.priceMin}`, `${t.common.to} ${facets.priceMax}`], 500)}</Group>
      <Group title={t.cars.filter.year}>{range("yearMin", "yearMax", [String(facets.yearMin), String(facets.yearMax)])}</Group>
      <Group title={t.cars.filter.mileage}>
        <Select
          value={f.params.get("mileageMax") ?? ""}
          onChange={(e) => f.set("mileageMax", e.target.value)}
          placeholder={t.common.any}
          options={[25000, 50000, 75000, 100000].map((v) => ({ value: String(v), label: `≤ ${v.toLocaleString("en-US")}` }))}
          className="h-11"
        />
      </Group>
      <Group title={t.cars.filter.fuel}>{chips("fuel", Object.entries(t.enums.fuel))}</Group>
      <Group title={t.cars.filter.engine}>{range("engineMin", "engineMax", ["1.0", "6.0"], 0.1)}</Group>
      <Group title={t.cars.filter.transmission}>{chips("transmission", Object.entries(t.enums.transmission))}</Group>
      <Group title={t.cars.filter.bodyType}>{chips("body", Object.entries(t.enums.body))}</Group>
      <Group title={t.cars.filter.drive}>{chips("drive", Object.entries(t.enums.drive))}</Group>
      <Group title={t.cars.filter.location}>{chips("location", facets.locations.map((l) => [l.value, l.value]))}</Group>
    </div>
  );
}

export function CarFiltersSidebar({ facets, t }: { facets: CarFacets; t: Labels }) {
  const f = useFilterParams();
  return (
    <aside className="hidden lg:block" aria-label={t.cars.filters}>
      <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-3xl border border-line bg-surface p-5 no-scrollbar">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="inline-flex items-center gap-2 font-medium">
            <SlidersHorizontal className="size-4 text-accent" /> {t.cars.filters}
            {f.pending && <Loader2 className="size-3.5 animate-spin text-subtle" />}
          </h2>
          {f.activeCount > 0 && (
            <button onClick={f.clear} className="text-xs text-subtle hover:text-fg">
              {t.cars.clearFilters}
            </button>
          )}
        </div>
        <FilterFields facets={facets} t={t} />
      </div>
    </aside>
  );
}

export function CarToolbar({ facets, t, total }: { facets: CarFacets; t: Labels; total: number }) {
  const f = useFilterParams();
  const [open, setOpen] = useState(false);
  const sorts = Object.entries(t.cars.sortOptions).map(([value, label]) => ({ value, label }));
  const activeChips = [
    ...MULTI.flatMap((k) =>
      f.list(k).map((v) => ({
        key: k,
        value: v,
        label: k === "fuel" ? t.enums.fuel[v as keyof typeof t.enums.fuel] : k === "body" ? t.enums.body[v as keyof typeof t.enums.body] : k === "transmission" ? t.enums.transmission[v as keyof typeof t.enums.transmission] : k === "drive" ? t.enums.drive[v as keyof typeof t.enums.drive] : v,
      })),
    ),
  ];

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-subtle" />
          <DebouncedInput type="search" placeholder={t.cars.search} aria-label={t.cars.search} value={f.params.get("q") ?? ""} onCommit={(v) => f.set("q", v)} className="h-12 pl-11" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-12 flex-1 lg:hidden" onClick={() => setOpen(true)}>
            <SlidersHorizontal className="size-4" />
            {t.cars.filters}
            {f.activeCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-accent text-[11px] font-semibold text-bg">{f.activeCount}</span>}
          </Button>
          <div className="w-full flex-1 sm:w-56 sm:flex-none">
            <Select aria-label={t.cars.sort} value={f.params.get("sort") ?? "newest"} onChange={(e) => f.set("sort", e.target.value === "newest" ? "" : e.target.value)} options={sorts} />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="mr-2 text-muted tabular">
          {t.cars.results.replace("{count}", String(total))}
          {f.pending && <Loader2 className="ml-2 inline size-3.5 animate-spin" />}
        </span>
        {activeChips.map((c) => (
          <button key={`${c.key}-${c.value}`} onClick={() => f.toggle(c.key, c.value)} className="inline-flex h-7 items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft px-3 text-xs text-fg hover:border-accent/60">
            {c.label}
            <X className="size-3" />
          </button>
        ))}
        {f.activeCount > 0 && (
          <button onClick={f.clear} className="text-xs text-subtle underline-offset-4 hover:text-fg hover:underline">
            {t.cars.clearFilters}
          </button>
        )}
      </div>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={t.cars.filters}
        side="bottom"
        closeLabel={t.common.close}
        footer={
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={f.clear}>
              {t.common.reset}
            </Button>
            <Button variant="primary" className="flex-[2]" onClick={() => setOpen(false)} loading={f.pending}>
              {t.cars.showResults.replace("{count}", String(total))}
            </Button>
          </div>
        }
      >
        <FilterFields facets={facets} t={t} />
      </Drawer>
    </div>
  );
}
