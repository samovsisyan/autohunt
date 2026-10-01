"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fmt, formatUsd } from "@/i18n/format";
import { Field, Input } from "@/components/ui/field";
import { RequestForm, type RequestFormLabels } from "@/components/forms/request-form";

/** YYYY-MM-DD in the visitor's own timezone. */
const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return isoDay(d);
};
const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

export function RentalBooking({
  carId,
  carTitle,
  pricePerDay,
  minDays,
  locale,
  t,
  formT,
}: {
  carId: string;
  carTitle: string;
  pricePerDay: number;
  minDays: number;
  locale: Locale;
  t: Dictionary["rent"];
  formT: RequestFormLabels;
}) {
  const today = isoDay(new Date());
  const [pickup, setPickup] = useState(() => addDays(today, 1));
  const [ret, setRet] = useState(() => addDays(today, 1 + Math.max(minDays, 3)));
  const days = pickup && ret ? daysBetween(pickup, ret) : 0;
  const error = days <= 0 ? t.booking.invalidDates : days < minDays ? fmt(t.booking.minDaysError, { count: minDays }) : null;
  const daysLabel = days === 1 ? t.oneDay : fmt(t.days, { count: days });

  return (
    <RequestForm
      type="RENTAL"
      locale={locale}
      t={{ ...formT, submit: t.booking.submit }}
      carId={carId}
      columns={1}
      disabled={!!error}
      defaults={{ message: `${carTitle} — ` }}
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label={t.booking.pickup} htmlFor="rent-pickup">
          <Input
            id="rent-pickup"
            name="pickup"
            type="date"
            required
            min={today}
            value={pickup}
            onChange={(e) => {
              const v = e.target.value;
              setPickup(v);
              // Keep the return date valid when the pick-up moves past it.
              if (v && (!ret || daysBetween(v, ret) < minDays)) setRet(addDays(v, minDays));
            }}
          />
        </Field>
        <Field label={t.booking.return} htmlFor="rent-return">
          <Input id="rent-return" name="return" type="date" required min={pickup ? addDays(pickup, minDays) : today} value={ret} onChange={(e) => setRet(e.target.value)} aria-invalid={error ? true : undefined} />
        </Field>
      </div>
      <div className="rounded-2xl border border-line bg-fg/[0.03] px-4 py-3.5" aria-live="polite">
        {error ? (
          <p className="text-sm text-danger">{error}</p>
        ) : (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-sm text-muted">
                <CalendarDays className="size-4 text-subtle" aria-hidden />
                {t.booking.total} {fmt(t.booking.totalFor, { days: daysLabel })}
              </span>
              <span className="tabular font-display text-xl font-semibold">{formatUsd(days * pricePerDay, locale)}</span>
            </div>
            <p className="mt-1 text-xs text-subtle">
              {formatUsd(pricePerDay, locale)} {t.perDay} × {daysLabel} · {t.booking.totalNote}
            </p>
          </>
        )}
      </div>
    </RequestForm>
  );
}
