"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "@/components/ui/toast";
import type { ActionResult } from "@/server/actions/admin/_utils";

/** Run a server action, toast the outcome and refresh server components. */
export function useAdminAction() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = <T,>(fn: () => Promise<ActionResult<T>>, opts: { success?: string; onSuccess?: (data: T | undefined) => void } = {}) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        if (opts.success) toast(opts.success);
        opts.onSuccess?.(res.data);
        router.refresh();
      } else {
        const fields = res.fields ? Object.entries(res.fields).map(([k, v]) => `${k}: ${v?.[0]}`).slice(0, 3).join("; ") : "";
        toast(fields ? `${res.error} — ${fields}` : res.error, "error");
      }
    });
  return { run, pending };
}
