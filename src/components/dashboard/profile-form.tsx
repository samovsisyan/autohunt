"use client";

import { useActionState, useEffect } from "react";
import { updateProfileAction } from "@/server/actions/dashboard";
import { Field, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { localeLabels, locales } from "@/i18n/config";

export function ProfileForm({
  user,
  labels,
}: {
  user: { name: string; email: string; phone: string | null; role: string; companyName: string | null; companyTaxId: string | null; locale: string };
  labels: { name: string; email: string; phone: string; company: string; taxId: string; language: string; save: string; saved: string; error: string };
}) {
  const [state, action, pending] = useActionState(updateProfileAction, null);
  useEffect(() => {
    if (state?.ok) toast(labels.saved);
    else if (state && !state.ok) toast(labels.error, "error");
  }, [state, labels.saved, labels.error]);

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <Field label={labels.name} htmlFor="p-name" className="sm:col-span-2">
        <Input id="p-name" name="name" defaultValue={user.name} required />
      </Field>
      <Field label={labels.email} htmlFor="p-email">
        <Input id="p-email" value={user.email} disabled readOnly />
      </Field>
      <Field label={labels.phone} htmlFor="p-phone">
        <Input id="p-phone" name="phone" type="tel" defaultValue={user.phone ?? ""} />
      </Field>
      {user.role === "CORPORATE" && (
        <>
          <Field label={labels.company} htmlFor="p-company">
            <Input id="p-company" name="companyName" defaultValue={user.companyName ?? ""} />
          </Field>
          <Field label={labels.taxId} htmlFor="p-tax">
            <Input id="p-tax" name="companyTaxId" defaultValue={user.companyTaxId ?? ""} />
          </Field>
        </>
      )}
      <Field label={labels.language} htmlFor="p-locale" className="sm:col-span-2">
        <Select id="p-locale" name="locale" defaultValue={user.locale} options={locales.map((l) => ({ value: l, label: localeLabels[l].name }))} />
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" loading={pending}>
          {labels.save}
        </Button>
      </div>
    </form>
  );
}
