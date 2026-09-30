"use client";

import { useState } from "react";
import { Send, Landmark } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/overlay";
import dynamic from "next/dynamic";
import type { RequestFormLabels } from "@/components/forms/request-form";

const RequestForm = dynamic(() => import("@/components/forms/request-form").then((m) => m.RequestForm));

export function CarRequestActions({
  carId,
  carTitle,
  price,
  locale,
  labels,
  formT,
  variant = "panel",
}: {
  carId: string;
  carTitle: string;
  price: string;
  locale: Locale;
  labels: { request: string; financing: string; close: string; stickyPrice: string };
  formT: RequestFormLabels;
  variant?: "panel" | "sticky";
}) {
  const [open, setOpen] = useState<null | "CAR_REQUEST" | "FINANCING">(null);

  const modal = (
    <Modal open={!!open} onClose={() => setOpen(null)} title={open === "FINANCING" ? labels.financing : labels.request} closeLabel={labels.close}>
      <div className="mb-5 flex items-center justify-between rounded-2xl border border-line bg-white/[0.03] px-4 py-3 text-sm">
        <span className="text-muted">{carTitle}</span>
        <span className="tabular font-semibold">{price}</span>
      </div>
      {open && <RequestForm key={open} type={open} locale={locale} t={formT} carId={carId} columns={1} />}
    </Modal>
  );

  if (variant === "sticky") {
    return (
      <>
        <div className="glass fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 flex items-center justify-between gap-3 rounded-2xl py-2.5 pr-2.5 pl-4 shadow-2xl lg:hidden">
          <div className="min-w-0">
            <p className="truncate text-[11px] text-subtle">{labels.stickyPrice}</p>
            <p className="tabular font-display text-lg font-semibold">{price}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen("FINANCING")} aria-label={labels.financing}>
              <Landmark className="size-4" />
            </Button>
            <Button variant="primary" size="sm" onClick={() => setOpen("CAR_REQUEST")}>
              {labels.request}
            </Button>
          </div>
        </div>
        {modal}
      </>
    );
  }

  return (
    <>
      <div className="grid gap-2.5">
        <Button variant="primary" size="lg" onClick={() => setOpen("CAR_REQUEST")}>
          <Send className="size-4" />
          {labels.request}
        </Button>
        <Button variant="outline" size="lg" onClick={() => setOpen("FINANCING")}>
          <Landmark className="size-4" />
          {labels.financing}
        </Button>
      </div>
      {modal}
    </>
  );
}
