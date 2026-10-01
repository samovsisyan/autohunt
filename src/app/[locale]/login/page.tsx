import type { Metadata } from "next";
import Image from "next/image";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { buildMetadata } from "@/server/seo";
import { AuthForm } from "@/components/forms/auth-form";
import img from "../../../../public/images/site/amg-gt.jpg";

export async function generateMetadata({ params }: PageProps<"/[locale]/login">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getDictionary(locale);
  return buildMetadata({ locale, path: "/login", title: t.meta.login.title, description: t.meta.login.description, noindex: true });
}

export default async function LoginPage({ params, searchParams }: PageProps<"/[locale]/login">) {
  const locale = (await params).locale as Locale;
  const next = (await searchParams).next;
  const t = await getDictionary(locale);
  return (
    <section className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 pt-28 pb-16 sm:px-8">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{t.auth.loginTitle}</h1>
          <p className="mt-3 text-muted">{t.auth.loginSubtitle}</p>
          <div className="mt-10">
            <AuthForm mode="login" locale={locale} t={t.auth} forms={t.forms} next={typeof next === "string" ? next : undefined} errorText={t.common.error} />
          </div>
          <p className="mt-8 rounded-xl border border-line bg-fg/[0.02] px-4 py-3 text-center text-xs text-subtle">{t.auth.demo}</p>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <Image src={img} alt="" fill placeholder="blur" sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/30 to-transparent" />
      </div>
    </section>
  );
}
