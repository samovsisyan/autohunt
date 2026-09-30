"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/cn";

export function AuthForm({
  mode,
  locale,
  t,
  forms,
  next,
  errorText,
}: {
  mode: "login" | "register";
  locale: Locale;
  t: Dictionary["auth"];
  forms: Dictionary["forms"];
  next?: string;
  errorText: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<"CUSTOMER" | "CORPORATE">("CUSTOMER");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const body = { ...Object.fromEntries(new FormData(e.currentTarget).entries()), accountType, locale };
    const res = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    if (res?.ok) {
      const data = await res.json().catch(() => ({}));
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
      // Full navigation so the static header re-reads the session hint cookie.
      window.location.href = safeNext ?? (data.role === "ADMIN" ? "/admin" : `/${locale}/dashboard`);
      return;
    }
    const code = res ? (await res.json().catch(() => null))?.error?.code : null;
    setError(code === "INVALID_CREDENTIALS" ? t.invalid : code === "EMAIL_TAKEN" ? t.exists : errorText);
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {mode === "register" && (
        <>
          <Field label={t.accountType}>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-white/[0.03] p-1">
              {(["CUSTOMER", "CORPORATE"] as const).map((v) => (
                <button key={v} type="button" onClick={() => setAccountType(v)} aria-pressed={accountType === v} className={cn("h-10 rounded-lg text-sm transition-colors", accountType === v ? "bg-white/10 text-fg" : "text-subtle")}>
                  {v === "CUSTOMER" ? t.individual : t.corporate}
                </button>
              ))}
            </div>
          </Field>
          <Field label={forms.name} htmlFor="name">
            <Input id="name" name="name" required autoComplete="name" />
          </Field>
          {accountType === "CORPORATE" && (
            <Field label={forms.company} htmlFor="companyName">
              <Input id="companyName" name="companyName" required autoComplete="organization" />
            </Field>
          )}
          <Field label={forms.phone} htmlFor="phone">
            <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder={forms.placeholderPhone} />
          </Field>
        </>
      )}
      <Field label={forms.email} htmlFor="email">
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </Field>
      <Field label={forms.password} htmlFor="password">
        <Input id="password" name="password" type="password" required minLength={mode === "register" ? 8 : 1} autoComplete={mode === "login" ? "current-password" : "new-password"} />
      </Field>
      {error && <p className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">{error}</p>}
      <Button type="submit" size="lg" className="w-full" loading={loading}>
        {mode === "login" ? t.login : t.register}
      </Button>
      <p className="pt-2 text-center text-sm text-muted">
        {mode === "login" ? t.noAccount : t.haveAccount}{" "}
        <Link href={`/${locale}/${mode === "login" ? "register" : "login"}`} className="text-accent hover:underline">
          {mode === "login" ? t.register : t.login}
        </Link>
      </p>
    </form>
  );
}
