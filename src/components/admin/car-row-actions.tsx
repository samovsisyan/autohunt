"use client";

import Link from "next/link";
import { Eye, EyeOff, BadgeDollarSign, Pencil, Trash2, Undo2 } from "lucide-react";
import { deleteCarAction, setCarFlagsAction } from "@/server/actions/admin/cars";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "./confirm-button";
import { useAdminAction } from "./hooks";

export function CarRowActions({ id, published, status, title }: { id: string; published: boolean; status: string; title: string }) {
  const { run, pending } = useAdminAction();
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="sm" disabled={pending} onClick={() => run(() => setCarFlagsAction(id, { published: !published }), { success: published ? "Unpublished" : "Published" })} title={published ? "Unpublish" : "Publish"}>
        {published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
      {status === "SOLD" ? (
        <Button variant="ghost" size="sm" disabled={pending} onClick={() => run(() => setCarFlagsAction(id, { status: "AVAILABLE" }), { success: "Marked available" })} title="Mark available">
          <Undo2 className="size-4" />
        </Button>
      ) : (
        <Button variant="ghost" size="sm" disabled={pending} onClick={() => run(() => setCarFlagsAction(id, { status: "SOLD" }), { success: "Marked sold" })} title="Mark sold">
          <BadgeDollarSign className="size-4" />
        </Button>
      )}
      <Link href={`/admin/cars/${id}`} className="inline-flex h-9 items-center rounded-lg px-2.5 text-muted hover:bg-white/5 hover:text-fg" title="Edit">
        <Pencil className="size-4" />
      </Link>
      <ConfirmButton title="Delete car?" message={`“${title}” and its photos, documents and translations will be permanently removed.`} onConfirm={() => run(() => deleteCarAction(id), { success: "Car deleted" })}>
        <Trash2 className="size-4 text-danger" />
      </ConfirmButton>
    </div>
  );
}
