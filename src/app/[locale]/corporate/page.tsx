import type { Metadata } from "next";
import Image from "next/image";
import { Building2, Users, Package, RefreshCw, ClipboardCheck, Wrench } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formLabels } from "@/i18n/labels";
import { buildMetadata } from "@/server/seo";
import { PageHeader } from "@/components/layout/page-header";
import { RequestForm } from "@/components/forms/request-form";
import { buttonClasses } from "@/components/ui/button";
import fleet from "../../../../public/images/site/fleet.jpg";

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[locale]/corporate">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getDictionary(locale);
  return buildMetadata({ locale, path: "/corporate", title: t.meta.corporate.title, description: t.meta.corporate.description, image: "/images/site/fleet.jpg" });
}

const icons = [Building2, Users, Package, RefreshCw, ClipboardCheck, Wrench];

export default async function CorporatePage({ params }: PageProps<"/[locale]/corporate">) {
  const locale = (await params).locale as Locale;
  const t = await getDictionary(locale);
  const c = t.corporate;
  return (
    <>
      <PageHeader
        crumbs={[
          { name: t.nav.home, href: href(locale) },
          { name: t.nav.corporate, href: href(locale, "/corporate") },
        ]}
        eyebrow={c.eyebrow}
        title={c.title}
        subtitle={c.text}
      >
        <a href="#quote" className={buttonClasses("primary", "lg", "mt-8")}>
          {c.cta}
        </a>
      </PageHeader>

      <section className="container-page py-20">
        <div className="relative aspect-[21/9] overflow-hidden rounded-[2rem] border border-line">
          <Image src={fleet} alt="" fill placeholder="blur" sizes="(min-width: 1320px) 1320px, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent" />
          <dl className="absolute inset-x-0 bottom-0 grid grid-cols-3 gap-4 p-6 sm:p-10">
            {c.stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="mt-1 text-xs text-muted sm:text-sm">{s.label}</dt>
                <dd className="font-display text-2xl font-semibold sm:text-5xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {c.services.map((s, i) => {
            const Icon = icons[i];
            return (
              <li key={s.title} className="rounded-3xl border border-line bg-surface p-7 transition-colors hover:border-line-strong">
                <span className="grid size-11 place-items-center rounded-2xl bg-accent-soft text-accent">
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-6 font-display text-lg font-semibold">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section id="quote" className="scroll-mt-24 border-t border-line bg-surface py-24">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{c.formTitle}</h2>
            <p className="mt-4 text-lg text-muted">{c.formSubtitle}</p>
          </div>
          <div className="rounded-3xl border border-line bg-bg p-6 sm:p-8">
            <RequestForm type="CORPORATE" locale={locale} t={formLabels(t, c.cta)} />
          </div>
        </div>
      </section>
    </>
  );
}
