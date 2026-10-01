"use client";

import Link from "next/link";
import { Eye, EyeOff, BadgeDollarSign, Pencil, Trash2, Undo2 } from "lucide-react";
import { deleteCarAction, setCarFlagsAction } from "@/server/actions/admin/cars";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "./confirm-button";
import { useAdminAction } from "./hooks";
import { useAdminT } from "./i18n";
import { fmt } from "@/i18n/format";

export function CarRowActions({ id, published, status, title }: { id: string; published: boolean; status: string; title: string }) {
  const { run, pending } = useAdminAction();
  const { t } = useAdminT();
  const c = t.cars;
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="sm" disabled={pending} onClick={() => run(() => setCarFlagsAction(id, { published: !published }), { success: published ? c.unpublishedToast : c.publishedToast })} title={published ? c.unpublish : c.publish}>
        {published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
      {status === "SOLD" ? (
        <Button variant="ghost" size="sm" disabled={pending} onClick={() => run(() => setCarFlagsAction(id, { status: "AVAILABLE" }), { success: c.markedAvailable })} title={c.markAvailable}>
          <Undo2 className="size-4" />
        </Button>
      ) : (
        <Button variant="ghost" size="sm" disabled={pending} onClick={() => run(() => setCarFlagsAction(id, { status: "SOLD" }), { success: c.markedSold })} title={c.markSold}>
          <BadgeDollarSign className="size-4" />
        </Button>
      )}
      <Link href={`/admin/cars/${id}`} className="inline-flex h-9 items-center rounded-lg px-2.5 text-muted hover:bg-fg/5 hover:text-fg" title={t.common.edit}>
        <Pencil className="size-4" />
      </Link>
      <ConfirmButton title={c.deleteTitle} message={fmt(c.deleteMessage, { title })} onConfirm={() => run(() => deleteCarAction(id), { success: c.deletedToast })}>
        <Trash2 className="size-4 text-danger" />
      </ConfirmButton>
    </div>
  );
}
