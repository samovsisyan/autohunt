"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useAdminT } from "./i18n";

export function AdminLoginForm() {
  const { t } = useAdminT();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget).entries())),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok && data?.role === "ADMIN") {
      window.location.href = "/admin";
      return;
    }
    if (res?.ok) await fetch("/api/auth/logout", { method: "POST" });
    setError(res?.ok ? t.login.noAccess : t.login.invalid);
    setLoading(false);
  }
  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      <Field label={t.login.email} htmlFor="email">
        <Input id="email" name="email" type="email" required autoComplete="username" />
      </Field>
      <Field label={t.login.password} htmlFor="password">
        <Input id="password" name="password" type="password" required autoComplete="current-password" />
      </Field>
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" className="w-full" size="lg" loading={loading}>
        {t.login.submit}
      </Button>
    </form>
  );
}
