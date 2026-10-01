"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bookmark, Share2, Send, Loader2, Info, ArrowRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fmt, formatAmd, formatUsd } from "@/i18n/format";
import type { EstimateInput, EstimateResult, FuelType } from "@/server/calculator/engine";
import type { CalculatorOptions } from "@/server/calculator/calculator.service";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Button, buttonClasses } from "@/components/ui/button";
import { Chip, Field, Input, Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/overlay";
import { toast } from "@/components/ui/toast";
import dynamic from "next/dynamic";
import type { RequestFormLabels } from "@/components/forms/request-form";

const RequestForm = dynamic(() => import("@/components/forms/request-form").then((m) => m.RequestForm));
import { cn } from "@/lib/cn";
import { CostBreakdown } from "./cost-breakdown";

const FUELS: FuelType[] = ["GASOLINE", "HYBRID", "PLUGIN_HYBRID", "DIESEL", "ELECTRIC"];

export interface CalculatorProps {
  locale: Locale;
  options: CalculatorOptions;
  initialInput: EstimateInput;
  initialResult: EstimateResult | null;
  t: Dictionary["calculator"];
  fuelLabels: Dictionary["enums"]["fuel"];
  formT: RequestFormLabels;
  /** Compact mode for the homepage section: fewer controls, link to the full page. */
  variant?: "full" | "embedded";
  fullHref?: string;
}

export function Calculator({ locale, options, initialInput, initialResult, t, fuelLabels, formT, variant = "full", fullHref }: CalculatorProps) {
  const [input, setInput] = useState<EstimateInput>(initialInput);
  const [result, setResult] = useState<EstimateResult | null>(initialResult);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const first = useRef(true);

  // Debounced, abortable recalculation on every input change (server computes; no rates in the browser).
  useEffect(() => {
    if (first.current && initialResult) {
      first.current = false;
      return;
    }
    first.current = false;
    const ctrl = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/calculator/estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(String(res.status));
        setResult(await res.json());
        setFailed(false);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setFailed(true);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [input, initialResult]);

  // Keep the URL shareable without adding history entries.
  useEffect(() => {
    if (variant !== "full") return;
    const q = new URLSearchParams(Object.entries(input).map(([k, v]) => [k, String(v)]));
    window.history.replaceState(null, "", `${window.location.pathname}?${q}`);
  }, [input, variant]);

  const set = <K extends keyof EstimateInput>(key: K, value: EstimateInput[K]) => setInput((p) => ({ ...p, [key]: value }));
  const usd = (n: number) => formatUsd(n, locale);
  const isEv = input.fuel === "ELECTRIC";

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const q = new URLSearchParams(Object.entries(input).map(([k, v]) => [k, String(v)]));
    return `${window.location.origin}/${locale}/calculator?${q}`;
  }, [input, locale]);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      if (!res.ok) throw new Error();
      const { shareId, owned } = await res.json();
      try {
        const list = JSON.parse(localStorage.getItem("ah:calculations") ?? "[]");
        localStorage.setItem("ah:calculations", JSON.stringify([shareId, ...list].slice(0, 20)));
      } catch {}
      toast(owned ? t.savedToast : t.loginToSave, owned ? "success" : "info");
    } catch {
      toast(formT.error, "error");
    } finally {
      setSaving(false);
    }
  }

  async function share() {
    const data = { title: "AutoHunt", text: result ? `${t.resultTitle}: ${usd(result.total)}` : t.resultTitle, url: shareUrl };
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      toast(t.sharedToast);
    } catch {}
  }

  const embedded = variant === "embedded";

  return (
    <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr] lg:gap-6">
      {/* ── Inputs ── */}
      <div className="rounded-3xl border border-line bg-surface p-5 sm:p-7 lg:self-start">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">{t.inputs}</h2>
          {loading && <Loader2 className="size-4 animate-spin text-accent" aria-label={t.calculating} />}
        </div>

        <div className="space-y-5">
          <Field label={t.auction}>
            <div className="flex flex-wrap gap-2">
              {options.auctions.map((a) => (
                <Chip key={a.value} active={input.auction === a.value} onClick={() => set("auction", a.value)} className="h-10 px-5">
                  {a.label}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label={t.price} htmlFor="calc-price">
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-subtle">$</span>
              <Input
                id="calc-price"
                type="number"
                inputMode="numeric"
                min={0}
                step={100}
                value={input.price || ""}
                onChange={(e) => set("price", Math.max(0, Number(e.target.value)))}
                className="tabular pl-8 text-lg font-medium"
              />
            </div>
            <input
              type="range"
              min={1000}
              max={80000}
              step={250}
              value={Math.min(80000, Math.max(1000, input.price))}
              onChange={(e) => set("price", Number(e.target.value))}
              className="mt-3 w-full accent-[var(--color-accent)]"
              aria-label={t.price}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label={t.year} htmlFor="calc-year">
              <Select
                id="calc-year"
                value={String(input.year)}
                onChange={(e) => set("year", Number(e.target.value))}
                options={options.years.map((y) => ({ value: String(y), label: String(y) }))}
              />
            </Field>
            <Field label={`${t.engine}, ${t.engineUnit}`} htmlFor="calc-engine">
              <Input
                id="calc-engine"
                type="number"
                inputMode="decimal"
                min={0}
                max={8}
                step={0.1}
                disabled={isEv}
                value={isEv ? "" : input.engine || ""}
                placeholder={isEv ? "—" : "2.0"}
                onChange={(e) => set("engine", Math.max(0, Number(e.target.value)))}
                className="tabular"
              />
            </Field>
          </div>

          <Field label={t.fuel}>
            <div className="flex flex-wrap gap-2">
              {FUELS.map((f) => (
                <Chip key={f} active={input.fuel === f} onClick={() => set("fuel", f)}>
                  {fuelLabels[f]}
                </Chip>
              ))}
            </div>
          </Field>

          <div className={cn("grid gap-4", embedded ? "grid-cols-2" : "sm:grid-cols-3")}>
            <Field label={t.vehicleType} htmlFor="calc-type" className={cn(embedded && "col-span-2 sm:col-span-1")}>
              <Select id="calc-type" value={input.vehicleType} onChange={(e) => set("vehicleType", e.target.value)} options={options.vehicleTypes} />
            </Field>
            {!embedded && (
              <Field label={t.country} htmlFor="calc-origin">
                <Select id="calc-origin" value={input.origin} onChange={(e) => set("origin", e.target.value)} options={options.origins} />
              </Field>
            )}
            <Field label={t.destination} htmlFor="calc-dest" className={cn(embedded && "col-span-2 sm:col-span-1")}>
              <Select id="calc-dest" value={input.destination} onChange={(e) => set("destination", e.target.value)} options={options.destinations} />
            </Field>
          </div>
        </div>
      </div>

      {/* ── Result ── */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-elevated to-surface p-5 sm:p-7 lg:sticky lg:top-24 lg:self-start">
        <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-accent/10 blur-3xl" aria-hidden />
        <p className="text-sm text-muted">{t.resultTitle}</p>
        {failed && !result ? (
          <p className="mt-6 text-danger">{t.unavailable}</p>
        ) : result ? (
          <>
            <div className={cn("mt-2 transition-opacity", loading && "opacity-60")} aria-live="polite">
              <AnimatedNumber
                value={result.total}
                format={usd}
                className="tabular block font-display text-5xl leading-none font-semibold tracking-tight sm:text-6xl"
              />
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                {result.totalAmd !== null && (
                  <span className="tabular text-fg/90">
                    <AnimatedNumber value={result.totalAmd} format={(n) => formatAmd(n, locale)} />
                  </span>
                )}
                <span className="text-subtle">{fmt(t.overPrice, { percent: result.markupPercent })}</span>
              </div>
            </div>

            <CostBreakdown lines={result.lines} total={result.total} t={t} format={usd} className="mt-7" compact={embedded} />

            <p className="mt-5 flex gap-2.5 rounded-2xl border border-line bg-fg/[0.02] p-3.5 text-xs leading-relaxed text-muted">
              <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
              {t.disclaimer}
            </p>

            {embedded ? (
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <Button variant="primary" onClick={() => setRequestOpen(true)}>
                  <Send className="size-4" />
                  {t.request}
                </Button>
                <Link href={fullHref ?? `/${locale}/calculator`} className={buttonClasses("outline")}>
                  {t.openFull}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : (
              <div className="mt-5 grid gap-2 sm:grid-cols-[1.4fr_1fr_1fr]">
                <Button variant="primary" onClick={() => setRequestOpen(true)}>
                  <Send className="size-4" />
                  {t.request}
                </Button>
                <Button variant="outline" onClick={save} loading={saving}>
                  {!saving && <Bookmark className="size-4" />}
                  {t.save}
                </Button>
                <Button variant="outline" onClick={share}>
                  <Share2 className="size-4" />
                  {t.share}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="mt-6 h-72 animate-pulse rounded-2xl bg-fg/[0.03]" />
        )}
      </div>

      {/* Mobile sticky total (full page only) */}
      {!embedded && result && (
        <div className="glass fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 flex items-center justify-between gap-3 rounded-2xl py-2.5 pr-2.5 pl-4 shadow-2xl lg:hidden">
          <div>
            <p className="text-[11px] text-subtle">{t.total}</p>
            <AnimatedNumber value={result.total} format={usd} className="tabular font-display text-lg font-semibold" />
          </div>
          <Button variant="primary" size="sm" onClick={() => setRequestOpen(true)}>
            {t.request}
          </Button>
        </div>
      )}

      <Modal open={requestOpen} onClose={() => setRequestOpen(false)} title={t.request}>
        {result && (
          <div className="mb-5 flex items-center justify-between rounded-2xl border border-line bg-fg/[0.03] px-4 py-3 text-sm">
            <span className="text-muted">
              {input.year} · {fuelLabels[input.fuel]} · {usd(input.price)}
            </span>
            <span className="tabular font-semibold text-positive">{usd(result.total)}</span>
          </div>
        )}
        <RequestForm
          type="IMPORT"
          locale={locale}
          t={formT}
          columns={1}
          fields={["name", "phone", "email", "vin", "message"]}
          payload={{ calculation: input, estimatedTotal: result?.total }}
          defaults={{ year: String(input.year), budget: String(result?.total ?? ""), auction: input.auction }}
        />
      </Modal>
    </div>
  );
}
