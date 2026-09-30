import type { Metadata } from "next";
import Image from "next/image";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { buildMetadata } from "@/server/seo";
import { AuthForm } from "@/components/forms/auth-form";
import img from "../../../../public/images/site/amg-gt.jpg";

export async function generateMetadata({ params }: PageProps<"/[locale]/register">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getDictionary(locale);
  return buildMetadata({ locale, path: "/register", title: t.meta.register.title, description: t.meta.register.description, noindex: true });
}

export default async function RegisterPage({ params, searchParams }: PageProps<"/[locale]/register">) {
  const locale = (await params).locale as Locale;
  const next = (await searchParams).next;
  const t = await getDictionary(locale);
  return (
    <section className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 pt-28 pb-16 sm:px-8">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{t.auth.registerTitle}</h1>
          <p className="mt-3 text-muted">{t.auth.registerSubtitle}</p>
          <div className="mt-10">
            <AuthForm mode="register" locale={locale} t={t.auth} forms={t.forms} next={typeof next === "string" ? next : undefined} errorText={t.common.error} />
          </div>
          
        </div>
      </div>
      <div className="relative hidden lg:block">
        <Image src={img} alt="" fill placeholder="blur" sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/30 to-transparent" />
      </div>
    </section>
  );
}
