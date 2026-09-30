import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CarFront,
  ClipboardCheck,
  FileCheck2,
  Gavel,
  Handshake,
  LineChart,
  Package,
  Receipt,
  RefreshCw,
  Search,
  Ship,
  ShieldCheck,
  Truck,
  Users,
  Wrench,
  KeyRound,
  Landmark,
  Plus,
} from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { buttonClasses } from "@/components/ui/button";
import { Eyebrow, SectionHeader } from "@/components/ui/section";
import type { FaqItem } from "@/server/services/content.service";
import fleetImg from "../../../public/images/site/fleet.jpg";
import { PhoneMockup } from "./phone-mockup";

const stepIcons = [Search, Gavel, Truck, Ship, Landmark, FileCheck2, KeyRound];

export function ProcessSteps({ t, locale, compact }: { t: Dictionary; locale: Locale; compact?: boolean }) {
  return (
    <section className="defer-render py-24 sm:py-32" id="how-it-works">
      <div className="container-page">
        <SectionHeader
          eyebrow={t.process.eyebrow}
          title={t.process.title}
          subtitle={t.process.subtitle}
          action={
            !compact && (
              <Link href={href(locale, "/import")} className={buttonClasses("outline")}>
                {t.nav.import}
                <ArrowRight className="size-4" />
              </Link>
            )
          }
        />
        <ol className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 xl:gap-3">
          <span className="pointer-events-none absolute top-[2.35rem] right-[7%] left-[7%] hidden h-px bg-gradient-to-r from-accent/0 via-accent/40 to-positive/0 xl:block" aria-hidden />
          {t.process.steps.map((step, i) => {
            const Icon = stepIcons[i] ?? Package;
            return (
              <li key={step.title} className="relative rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-line-strong xl:border-0 xl:bg-transparent xl:p-0 xl:text-center">
                <div className="flex items-center gap-4 xl:flex-col xl:gap-5">
                  <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl border border-line-strong bg-elevated text-accent xl:size-[4.7rem] xl:rounded-3xl">
                    <Icon className="size-5 xl:size-6" aria-hidden />
                    <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-fg text-[11px] font-semibold text-bg">{i + 1}</span>
                  </span>
                  <h3 className="font-display text-base font-semibold">{step.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted xl:mt-2 xl:px-1">{step.text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export function AuctionSources({ t, className }: { t: Dictionary; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-4 text-xs tracking-[0.16em] text-subtle uppercase">{t.import.sources}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { name: "Copart", text: t.import.copartText, color: "#1d4ed8" },
          { name: "IAAI", text: t.import.iaaiText, color: "#dc2626" },
        ].map((a) => (
          <div key={a.name} className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl font-display text-sm font-bold text-white" style={{ background: a.color }}>
                {a.name[0]}
              </span>
              <p className="font-display text-lg font-semibold">{a.name}</p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{a.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ImportTeaser({ t, locale }: { t: Dictionary; locale: Locale }) {
  const icons = [LineChart, ShieldCheck, Receipt];
  return (
    <section className="defer-render relative overflow-hidden border-y border-line bg-surface py-24 sm:py-32">
      <div className="pointer-events-none absolute -top-40 left-1/3 size-[500px] rounded-full bg-accent/5 blur-3xl" aria-hidden />
      <div className="container-page grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <Eyebrow>{t.import.eyebrow}</Eyebrow>
          <h2 className="font-display text-3xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">{t.import.headline}</h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{t.import.text}</p>
          <ul className="mt-8 space-y-4">
            {t.import.benefits.map((b, i) => {
              const Icon = icons[i];
              return (
                <li key={b.title} className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-positive-soft text-positive">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-medium">{b.title}</p>
                    <p className="text-sm text-muted">{b.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href={href(locale, "/import")} className={buttonClasses("primary", "lg")}>
              {t.import.submit}
              <ArrowRight className="size-4" />
            </Link>
            <Link href={href(locale, "/import#search")} className={buttonClasses("outline", "lg")}>
              {t.import.noCar}
            </Link>
          </div>
        </div>
        <AuctionSources t={t} className="lg:pl-10" />
      </div>
    </section>
  );
}

const serviceIcons = [Building2, Users, Package, RefreshCw, ClipboardCheck, Wrench];

export function CorporateSection({ t, locale }: { t: Dictionary; locale: Locale }) {
  const c = t.corporate;
  return (
    <section className="defer-render py-24 sm:py-32">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[2rem] border border-line">
          <Image src={fleetImg} alt="" fill placeholder="blur" sizes="(min-width: 1320px) 1320px, 100vw" className="object-cover object-center opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/90 to-bg/40" />
          <div className="relative grid gap-12 p-6 py-12 sm:p-12 lg:grid-cols-[1fr_1.1fr] lg:p-16">
            <div>
              <Eyebrow>{c.eyebrow}</Eyebrow>
              <h2 className="font-display text-3xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">{c.title}</h2>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">{c.text}</p>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
                {c.stats.map((s) => (
                  <div key={s.label} className="flex flex-col-reverse">
                    <dt className="mt-1 text-xs leading-snug text-subtle">{s.label}</dt>
                    <dd className="font-display text-3xl font-semibold text-fg">{s.value}</dd>
                  </div>
                ))}
              </dl>
              <Link href={href(locale, "/corporate")} className={buttonClasses("primary", "lg", "mt-10")}>
                <Handshake className="size-4" />
                {c.cta}
              </Link>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {c.services.map((s, i) => {
                const Icon = serviceIcons[i];
                return (
                  <li key={s.title} className="glass rounded-2xl p-5 transition-colors hover:border-line-strong">
                    <Icon className="size-5 text-accent" aria-hidden />
                    <p className="mt-4 font-medium">{s.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.text}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AppSection({ t, locale, standalone }: { t: Dictionary; locale: Locale; standalone?: boolean }) {
  const a = t.appSection;
  return (
    <section className="defer-render relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute top-1/2 right-0 size-[600px] -translate-y-1/2 rounded-full bg-positive/5 blur-3xl" aria-hidden />
      <div className="container-page grid items-center gap-16 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <PhoneMockup t={a.mock} />
        </div>
        <div className="order-1 lg:order-2">
          <Eyebrow>{a.eyebrow}</Eyebrow>
          {standalone ? (
            <h1 className="font-display text-4xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">{a.title}</h1>
          ) : (
            <h2 className="font-display text-3xl leading-[1.1] font-semibold tracking-tight sm:text-5xl">{a.title}</h2>
          )}
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">{a.text}</p>
          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 sm:max-w-md">
            {a.features.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm">
                <BadgeCheck className="size-4 shrink-0 text-positive" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            {!standalone && (
              <Link href={href(locale, "/app")} className={buttonClasses("primary", "lg")}>
                {a.cta}
                <ArrowRight className="size-4" />
              </Link>
            )}
            <span className="text-sm text-subtle">{a.comingSoon}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const trustIcons = [Receipt, Gavel, Handshake, Building2];

export function TrustSection({ t }: { t: Dictionary }) {
  return (
    <section className="defer-render border-y border-line bg-surface py-24 sm:py-32">
      <div className="container-page">
        <SectionHeader eyebrow={t.trust.eyebrow} title={t.trust.title} align="center" />
        <div className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {t.trust.items.map((item, i) => {
            const Icon = trustIcons[i];
            return (
              <div key={item.title} className="bg-surface p-7 transition-colors hover:bg-elevated">
                <Icon className="size-6 text-accent" aria-hidden />
                <h3 className="mt-6 font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
              </div>
            );
          })}
        </div>
        <dl className="mt-14 grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
          {t.trust.stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse">
              <dt className="mt-2 text-sm text-muted">{s.label}</dt>
              <dd className="tabular font-display text-4xl font-semibold tracking-tight sm:text-5xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function Faq({ t, items }: { t: Dictionary; items: FaqItem[] }) {
  if (!items.length) return null;
  return (
    <section className="defer-render py-24 sm:py-32" id="faq">
      <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <SectionHeader eyebrow={t.faq.eyebrow} title={t.faq.title} className="lg:sticky lg:top-28 lg:self-start" />
        <div className="divide-y divide-line border-y border-line">
          {items.map((item, i) => (
            <details key={i} className="group py-1" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left font-medium transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus className="size-5 shrink-0 text-subtle transition-transform duration-300 group-open:rotate-45" aria-hidden />
              </summary>
              <p className="pb-6 leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaBand({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <section className="defer-render pb-24 sm:pb-32">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[2rem] border border-line-strong bg-gradient-to-br from-elevated via-surface to-surface px-6 py-16 text-center sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[700px] -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" aria-hidden />
          <CarFront className="mx-auto size-8 text-accent" aria-hidden />
          <h2 className="mx-auto mt-6 max-w-3xl font-display text-3xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl">{t.cta.title}</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted">{t.cta.text}</p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={href(locale, "/cars")} className={buttonClasses("primary", "lg")}>
              {t.cta.primary}
              <ArrowRight className="size-4" />
            </Link>
            <Link href={href(locale, "/about#contact")} className={buttonClasses("secondary", "lg")}>
              {t.cta.secondary}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
