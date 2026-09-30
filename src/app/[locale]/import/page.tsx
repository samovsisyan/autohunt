import type { Metadata } from "next";
import Image from "next/image";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formLabels } from "@/i18n/labels";
import { buildMetadata } from "@/server/seo";
import { PageHeader } from "@/components/layout/page-header";
import { AuctionSources, ProcessSteps } from "@/components/home/sections";
import { ImportForms } from "@/components/forms/import-forms";
import { buttonClasses } from "@/components/ui/button";
import Link from "next/link";
import { Calculator as CalcIcon, LineChart, ShieldCheck, Receipt } from "lucide-react";
import img from "../../../../public/images/site/camaro-garage.jpg";

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[locale]/import">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getDictionary(locale);
  return buildMetadata({ locale, path: "/import", title: t.meta.import.title, description: t.meta.import.description });
}

export default async function ImportPage({ params }: PageProps<"/[locale]/import">) {
  const locale = (await params).locale as Locale;
  const t = await getDictionary(locale);
  const icons = [LineChart, ShieldCheck, Receipt];
  return (
    <>
      <PageHeader
        crumbs={[
          { name: t.nav.home, href: href(locale) },
          { name: t.nav.import, href: href(locale, "/import") },
        ]}
        eyebrow={t.import.title}
        title={t.import.headline}
        subtitle={t.import.text}
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="#request" className={buttonClasses("primary", "lg")}>
            {t.import.submit}
          </a>
          <Link href={href(locale, "/calculator")} className={buttonClasses("secondary", "lg")}>
            <CalcIcon className="size-4" />
            {t.hero.secondaryCta}
          </Link>
        </div>
      </PageHeader>

      <section className="container-page grid gap-10 py-20 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-line">
          <Image src={img} alt="" fill placeholder="blur" sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="space-y-8">
          <ul className="grid gap-4">
            {t.import.benefits.map((b, i) => {
              const Icon = icons[i];
              return (
                <li key={b.title} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-positive-soft text-positive">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="font-medium">{b.title}</p>
                    <p className="mt-1 text-sm text-muted">{b.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <AuctionSources t={t} />
        </div>
      </section>

      <div className="border-y border-line bg-surface">
        <ProcessSteps t={t} locale={locale} compact />
      </div>

      <section id="request" className="scroll-mt-24 py-24">
        <div className="container-page max-w-4xl">
          <ImportForms locale={locale} formT={formLabels(t)} submitImport={t.import.submit} submitSearch={t.import.submitSearch} t={t.import} />
        </div>
      </section>
    </>
  );
}
