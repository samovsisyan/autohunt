"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

function useOverlay(open: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      prevFocus?.focus?.();
    };
  }, [open, onClose]);
  return panelRef;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  closeLabel = "Close",
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  closeLabel?: string;
}) {
  const ref = useOverlay(open, onClose);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative max-h-[92dvh] w-full animate-slide-up overflow-y-auto rounded-t-3xl border border-line bg-surface p-6 shadow-2xl outline-none sm:max-w-lg sm:animate-fade-up sm:rounded-3xl sm:p-8",
          className,
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          {title && <h2 className="font-display text-xl font-semibold">{title}</h2>}
          <button onClick={onClose} className="-m-2 ml-auto rounded-lg p-2 text-muted hover:bg-white/5 hover:text-fg" aria-label={closeLabel}>
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  side = "right",
  closeLabel = "Close",
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  side?: "right" | "bottom";
  closeLabel?: string;
}) {
  const ref = useOverlay(open, onClose);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute flex flex-col border-line bg-surface shadow-2xl outline-none",
          side === "right"
            ? "inset-y-0 right-0 w-full max-w-md animate-slide-in-right border-l"
            : "inset-x-0 bottom-0 max-h-[88dvh] animate-slide-up rounded-t-3xl border-t",
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="-m-2 rounded-lg p-2 text-muted hover:bg-white/5 hover:text-fg" aria-label={closeLabel}>
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="border-t border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
