"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCustomerAction, setUserRoleAction } from "@/server/actions/admin/crm";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { useAdminAction } from "./hooks";

export function NewCustomerForm() {
  const router = useRouter();
  const { run, pending } = useAdminAction();
  const [f, setF] = useState({ name: "", email: "", phone: "", role: "CUSTOMER" as "CUSTOMER" | "CORPORATE" | "ADMIN", companyName: "", password: "" });
  return (
    <form
      className="grid max-w-2xl gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        run(() => createCustomerAction(f), { success: "Customer created", onSuccess: (d) => d && router.replace(`/admin/customers/${d.id}`) });
      }}
    >
      <Field label="Full name">
        <Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      </Field>
      <Field label="Type">
        <Select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as typeof f.role })} options={[{ value: "CUSTOMER", label: "Individual" }, { value: "CORPORATE", label: "Corporate" }, { value: "ADMIN", label: "Admin" }]} />
      </Field>
      <Field label="Email">
        <Input required type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      </Field>
      <Field label="Phone">
        <Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
      </Field>
      {f.role === "CORPORATE" && (
        <Field label="Company" className="sm:col-span-2">
          <Input value={f.companyName} onChange={(e) => setF({ ...f, companyName: e.target.value })} />
        </Field>
      )}
      <Field label="Initial password" hint="Share securely; the customer can sign in and track imports." className="sm:col-span-2">
        <Input required minLength={8} type="text" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" loading={pending}>
          Create customer
        </Button>
      </div>
    </form>
  );
}

export function RoleSelect({ id, role }: { id: string; role: "CUSTOMER" | "CORPORATE" | "ADMIN" }) {
  const { run, pending } = useAdminAction();
  return (
    <Select
      className="h-9 w-40 text-sm"
      disabled={pending}
      value={role}
      onChange={(e) => run(() => setUserRoleAction(id, e.target.value as typeof role), { success: "Role updated" })}
      options={[{ value: "CUSTOMER", label: "Individual" }, { value: "CORPORATE", label: "Corporate" }, { value: "ADMIN", label: "Admin" }]}
    />
  );
}
