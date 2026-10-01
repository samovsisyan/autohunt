"use client";

import { useState } from "react";
import { ChevronDown, Trash2, Mail, Phone } from "lucide-react";
import { deleteRequestAction, setRequestStatusAction } from "@/server/actions/admin/crm";
import { Select } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { useAdminAction } from "./hooks";
import { ConfirmButton } from "./confirm-button";
import { useAdminT } from "./i18n";
import { intlLocales } from "@/i18n/config";
import { fmt } from "@/i18n/format";

export interface RequestRowData {
  id: string;
  type: string;
  status: "NEW" | "IN_PROGRESS" | "QUOTED" | "CLOSED";
  name: string;
  phone: string;
  email: string | null;
  company: string | null;
  message: string | null;
  payload: Record<string, unknown> | null;
  locale: string;
  createdAt: string;
  car: string | null;
  user: string | null;
}

export function RequestRow({ r }: { r: RequestRowData }) {
  const [open, setOpen] = useState(r.status === "NEW");
  const { run, pending } = useAdminAction();
  const { t, locale } = useAdminT();
  const typeLabel = (t.enums.requestType as Record<string, string>)[r.type] ?? r.type;
  const payload = r.payload ? Object.entries(r.payload).filter(([, v]) => v !== null && v !== "" && typeof v !== "object") : [];
  const nested = r.payload ? Object.entries(r.payload).filter(([, v]) => v && typeof v === "object") : [];
  return (
    <li className="rounded-2xl border border-line bg-surface">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-4 px-5 py-4 text-left">
        <span className={cn("size-2 shrink-0 rounded-full", r.status === "NEW" ? "bg-accent" : "bg-transparent")} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">
            {r.name}
            {r.company && <span className="text-muted"> · {r.company}</span>}
          </span>
          <span className="block truncate text-xs text-subtle">
            {typeLabel} · {r.car ?? r.phone} · {new Date(r.createdAt).toLocaleString(intlLocales[locale], { dateStyle: "medium", timeStyle: "short" })} · {r.locale.toUpperCase()}
          </span>
        </span>
        <StatusBadge status={r.status} label={t.enums.requestStatus[r.status]} />
        <ChevronDown className={cn("size-4 shrink-0 text-subtle transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="border-t border-line px-5 py-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <a href={`tel:${r.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 text-accent hover:underline">
              <Phone className="size-4" /> {r.phone}
            </a>
            {r.email && (
              <a href={`mailto:${r.email}`} className="inline-flex items-center gap-2 text-accent hover:underline">
                <Mail className="size-4" /> {r.email}
              </a>
            )}
            {r.user && <span className="text-subtle">{fmt(t.requests.registeredUser, { email: r.user })}</span>}
          </div>
          {r.message && <p className="mt-3 rounded-xl bg-fg/[0.03] px-4 py-3 text-sm whitespace-pre-wrap text-muted">{r.message}</p>}
          {payload.length > 0 && (
            <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
              {payload.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-subtle">{k}</dt>
                  <dd>{String(v)}</dd>
                </div>
              ))}
            </dl>
          )}
          {nested.map(([k, v]) => (
            <details key={k} className="mt-3 text-xs text-subtle">
              <summary className="cursor-pointer">{k}</summary>
              <pre className="mt-2 overflow-x-auto rounded-xl bg-fg/[0.03] p-3">{JSON.stringify(v, null, 2)}</pre>
            </details>
          ))}
          <div className="mt-4 flex items-center justify-between gap-3">
            <Select className="h-9 w-44 text-sm" disabled={pending} value={r.status} onChange={(e) => run(() => setRequestStatusAction(r.id, e.target.value as RequestRowData["status"]), { success: t.requests.statusUpdated })} options={(["NEW", "IN_PROGRESS", "QUOTED", "CLOSED"] as const).map((s) => ({ value: s, label: t.enums.requestStatus[s] }))} />
            <ConfirmButton title={t.requests.deleteTitle} onConfirm={() => run(() => deleteRequestAction(r.id), { success: t.common.deleted })}>
              <Trash2 className="size-4 text-danger" />
            </ConfirmButton>
          </div>
        </div>
      )}
    </li>
  );
}
