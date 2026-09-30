import type { Dictionary } from "./dictionaries";
import type { RequestFormLabels } from "@/components/forms/request-form";

/** Slice of the dictionary that client-side lead forms need. */
export function formLabels(t: Dictionary, submit?: string): RequestFormLabels {
  return {
    ...t.forms,
    send: t.common.send,
    sending: t.common.sending,
    sent: t.common.sent,
    error: t.common.error,
    optional: t.common.optional,
    fuelOptions: t.enums.fuel,
    submit,
  };
}
