"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/cn";

type RequestType = "CAR_REQUEST" | "FINANCING" | "CONTACT" | "IMPORT" | "CAR_SEARCH" | "CORPORATE" | "RENTAL";

export type FieldName =
  | "company"
  | "name"
  | "phone"
  | "email"
  | "vin"
  | "auction"
  | "brand"
  | "model"
  | "year"
  | "budget"
  | "fuel"
  | "mileage"
  | "vehicles"
  | "requirements"
  | "message";

const layouts: Record<RequestType, FieldName[]> = {
  CAR_REQUEST: ["name", "phone", "email", "message"],
  FINANCING: ["name", "phone", "email", "message"],
  CONTACT: ["name", "phone", "email", "message"],
  IMPORT: ["vin", "auction", "brand", "model", "year", "budget", "fuel", "mileage", "message", "name", "phone", "email"],
  CAR_SEARCH: ["brand", "model", "year", "budget", "fuel", "mileage", "message", "name", "phone", "email"],
  CORPORATE: ["company", "name", "email", "phone", "vehicles", "budget", "requirements", "message"],
  RENTAL: ["name", "phone", "email", "message"],
};

const required: FieldName[] = ["name", "phone", "company"];
const wide: FieldName[] = ["message", "requirements", "vin"];

export type RequestFormLabels = Dictionary["forms"] & {
  send: string;
  sending: string;
  sent: string;
  error: string;
  optional: string;
  fuelOptions: Dictionary["enums"]["fuel"];
  submit?: string;
};

export function RequestForm({
  type,
  locale,
  t,
  carId,
  payload,
  defaults,
  className,
  onDone,
  columns = 2,
  fields,
  children,
  disabled,
}: {
  type: RequestType;
  locale: Locale;
  t: RequestFormLabels;
  carId?: string;
  payload?: Record<string, unknown>;
  defaults?: Partial<Record<FieldName, string>>;
  className?: string;
  onDone?: () => void;
  columns?: 1 | 2;
  /** Override the default field set for this request type. */
  fields?: FieldName[];
  /** Extra controls rendered above the contact fields; their named inputs are submitted too. */
  children?: ReactNode;
  /** Blocks submitting (e.g. while the extra controls are invalid). */
  disabled?: boolean;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (disabled) return;
    setState("sending");
    setErrors({});
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const body: Record<string, unknown> = { ...data, type, locale };
    if (carId) body.carId = carId;
    if (payload) body.payload = payload;
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setState("sent");
        onDone?.();
        return;
      }
      const err = await res.json().catch(() => null);
      if (err?.error?.code === "VALIDATION_ERROR") {
        setErrors(Object.fromEntries(Object.keys(err.error.details ?? {}).map((k) => [k, t.error])));
      }
      setState("error");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className={cn("flex flex-col items-center rounded-2xl border border-positive/25 bg-positive-soft px-6 py-10 text-center", className)}>
        <CheckCircle2 className="size-10 text-positive" />
        <p className="mt-4 max-w-sm text-base">{t.sent}</p>
      </div>
    );
  }

  const labelFor: Record<FieldName, string> = {
    company: t.company,
    name: type === "CORPORATE" ? t.contactPerson : t.name,
    phone: t.phone,
    email: t.email,
    vin: t.vin,
    auction: t.auction,
    brand: t.brand,
    model: t.model,
    year: t.year,
    budget: t.budget,
    fuel: t.fuel,
    mileage: t.mileage,
    vehicles: t.vehicles,
    requirements: t.requirements,
    message: type === "IMPORT" || type === "CAR_SEARCH" ? t.additional : t.message,
  };

  const control = (name: FieldName) => {
    const id = `${type}-${name}`;
    const common = { id, name, defaultValue: defaults?.[name], "aria-invalid": errors[name] ? true : undefined, required: required.includes(name) };
    switch (name) {
      case "message":
      case "requirements":
        return <Textarea {...common} rows={3} />;
      case "auction":
        return (
          <Select
            {...common}
            placeholder={t.anyAuction}
            options={[
              { value: "COPART", label: "Copart" },
              { value: "IAAI", label: "IAAI" },
            ]}
          />
        );
      case "fuel":
        return (
          <Select
            {...common}
            placeholder="—"
            options={Object.entries(t.fuelOptions).map(([value, label]) => ({ value, label }))}
          />
        );
      case "phone":
        return <Input {...common} type="tel" autoComplete="tel" inputMode="tel" placeholder={t.placeholderPhone} />;
      case "email":
        return <Input {...common} type="email" autoComplete="email" />;
      case "name":
        return <Input {...common} autoComplete="name" />;
      case "company":
        return <Input {...common} autoComplete="organization" />;
      case "year":
      case "vehicles":
        return <Input {...common} type="number" inputMode="numeric" min={1} />;
      case "budget":
      case "mileage":
        return <Input {...common} type="number" inputMode="numeric" min={0} step={100} />;
      default:
        return <Input {...common} />;
    }
  };

  return (
    <form onSubmit={submit} className={cn("space-y-5", className)} noValidate={false}>
      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {children}
      <div className={cn("grid gap-4", columns === 2 && "sm:grid-cols-2")}>
        {(fields ?? layouts[type]).map((name) => (
          <Field
            key={name}
            label={
              <>
                {labelFor[name]}
                {!required.includes(name) && <span className="font-normal text-subtle"> · {t.optional}</span>}
              </>
            }
            htmlFor={`${type}-${name}`}
            error={errors[name]}
            className={cn(columns === 2 && wide.includes(name) && "sm:col-span-2")}
          >
            {control(name)}
          </Field>
        ))}
      </div>
      {state === "error" && <p className="text-sm text-danger">{t.error}</p>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-subtle">{t.consent}</p>
        <Button type="submit" variant="primary" size="lg" loading={state === "sending"} disabled={disabled} className="w-full sm:w-auto">
          {state === "sending" ? t.sending : (t.submit ?? t.send)}
        </Button>
      </div>
    </form>
  );
}
