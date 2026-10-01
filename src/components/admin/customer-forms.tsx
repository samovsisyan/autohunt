"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCustomerAction, setUserRoleAction } from "@/server/actions/admin/crm";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { useAdminAction } from "./hooks";
import { useAdminT } from "./i18n";
import type { AdminT } from "@/i18n/admin";

const roleOptions = (t: AdminT) => (["CUSTOMER", "CORPORATE", "ADMIN"] as const).map((value) => ({ value, label: t.enums.role[value].replace(/^\p{L}/u, (ch) => ch.toUpperCase()) }));

export function NewCustomerForm() {
  const router = useRouter();
  const { run, pending } = useAdminAction();
  const { t } = useAdminT();
  const c = t.customers;
  const [f, setF] = useState({ name: "", email: "", phone: "", role: "CUSTOMER" as "CUSTOMER" | "CORPORATE" | "ADMIN", companyName: "", password: "" });
  return (
    <form
      className="grid max-w-2xl gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        run(() => createCustomerAction(f), { success: c.createdToast, onSuccess: (d) => d && router.replace(`/admin/customers/${d.id}`) });
      }}
    >
      <Field label={c.fullName}>
        <Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      </Field>
      <Field label={c.type}>
        <Select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as typeof f.role })} options={roleOptions(t)} />
      </Field>
      <Field label={c.email}>
        <Input required type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      </Field>
      <Field label={c.phone}>
        <Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
      </Field>
      {f.role === "CORPORATE" && (
        <Field label={c.company} className="sm:col-span-2">
          <Input value={f.companyName} onChange={(e) => setF({ ...f, companyName: e.target.value })} />
        </Field>
      )}
      <Field label={c.password} hint={c.passwordHint} className="sm:col-span-2">
        <Input required minLength={8} type="text" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" loading={pending}>
          {c.create}
        </Button>
      </div>
    </form>
  );
}

export function RoleSelect({ id, role }: { id: string; role: "CUSTOMER" | "CORPORATE" | "ADMIN" }) {
  const { run, pending } = useAdminAction();
  const { t } = useAdminT();
  return (
    <Select
      className="h-9 w-40 text-sm"
      disabled={pending}
      value={role}
      onChange={(e) => run(() => setUserRoleAction(id, e.target.value as typeof role), { success: t.customers.roleUpdated })}
      options={roleOptions(t)}
    />
  );
}
