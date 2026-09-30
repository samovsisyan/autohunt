import type { Metadata } from "next";
import Image from "next/image";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formLabels } from "@/i18n/labels";
import { buildMetadata } from "@/server/seo";
import { getContact } from "@/server/services/content.service";
import { PageHeader } from "@/components/layout/page-header";
import { TrustSection } from "@/components/home/sections";
import { RequestForm } from "@/components/forms/request-form";
import team from "../../../../public/images/site/team.jpg";

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[locale]/about">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getDictionary(locale);
  return buildMetadata({ locale, path: "/about", title: t.meta.about.title, description: t.meta.about.description });
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const locale = (await params).locale as Locale;
  const [t, contact] = await Promise.all([getDictionary(locale), getContact(locale)]);
  return (
    <>
      <PageHeader
        crumbs={[
          { name: t.nav.home, href: href(locale) },
          { name: t.nav.about, href: href(locale, "/about") },
        ]}
        eyebrow="AutoHunt"
        title={t.about.title}
        subtitle={t.about.text}
      />
      <section className="container-page grid gap-10 py-20 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-line">
          <Image src={team} alt="" fill placeholder="blur" sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <ul className="space-y-4">
          {t.about.values.map((v, i) => (
            <li key={v.title} className="rounded-3xl border border-line bg-surface p-6">
              <span className="font-display text-sm text-accent tabular">0{i + 1}</span>
              <h2 className="mt-2 font-display text-xl font-semibold">{v.title}</h2>
              <p className="mt-2 text-muted">{v.text}</p>
            </li>
          ))}
        </ul>
      </section>
      <TrustSection t={t} />
      <section id="contact" className="scroll-mt-24 py-24">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{t.about.contactTitle}</h2>
            <ul className="mt-8 space-y-5">
              {[
                { icon: Phone, text: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` },
                { icon: Mail, text: contact.email, href: `mailto:${contact.email}` },
                { icon: MapPin, text: contact.address },
                { icon: Clock, text: contact.hours },
              ].map((c) => (
                <li key={c.text} className="flex items-center gap-4">
                  <span className="grid size-11 place-items-center rounded-2xl border border-line bg-surface text-accent">
                    <c.icon className="size-5" />
                  </span>
                  {c.href ? (
                    <a href={c.href} className="text-lg hover:text-accent">
                      {c.text}
                    </a>
                  ) : (
                    <span className="text-lg">{c.text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
            <RequestForm type="CONTACT" locale={locale} t={formLabels(t)} />
          </div>
        </div>
      </section>
    </>
  );
}
