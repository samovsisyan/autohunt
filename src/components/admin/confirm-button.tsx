"use client";

import { useState, type ReactNode } from "react";
import { Modal } from "@/components/ui/overlay";
import { Button } from "@/components/ui/button";
import { useAdminT } from "./i18n";

/** In-page confirmation (no native confirm() dialogs). */
export function ConfirmButton({
  children,
  title,
  message,
  confirmLabel,
  onConfirm,
  className,
  variant = "ghost",
}: {
  children: ReactNode;
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  className?: string;
  variant?: "ghost" | "danger" | "outline";
}) {
  const { t } = useAdminT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={variant} size="sm" className={className} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={title}>
        {message && <p className="text-sm text-muted">{message}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t.common.cancel}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setOpen(false);
              onConfirm();
            }}
          >
            {confirmLabel ?? t.confirm.delete}
          </Button>
        </div>
      </Modal>
    </>
  );
}
