import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calculator as CalcIcon, Check } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatAmd, formatUsd } from "@/i18n/format";
import { buttonClasses } from "@/components/ui/button";
import type { EstimateResult } from "@/server/calculator/engine";
import { lineColors } from "@/components/calculator/cost-breakdown";
import heroImg from "../../../public/images/site/hero.jpg";
import heroLightImg from "../../../public/images/site/porsche-911.jpg";

export function Hero({ locale, t, sample }: { locale: Locale; t: Dictionary; sample: EstimateResult | null }) {
  const h = t.hero;
  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden pt-28 pb-14 sm:pb-20 lg:items-center lg:pb-24">
      <div className="absolute inset-0 -z-20 lg:top-[10%] lg:left-[24%] lg:-right-[4%]">
        {/* One photo per theme, swapped in CSS so the right one shows before hydration. */}
        <Image
          src={heroImg}
          alt=""
          loading="eager"
          fill
          placeholder="blur"
          sizes="(min-width: 1024px) 80vw, 100vw"
          className="object-cover object-[68%_60%] brightness-[1.3] contrast-[1.08] light:hidden lg:object-[50%_58%]"
        />
        <Image
          src={heroLightImg}
          alt=""
          loading="eager"
          fill
          placeholder="blur"
          sizes="(min-width: 1024px) 80vw, 100vw"
          className="hidden object-cover object-[60%_75%] [mask-image:linear-gradient(to_right,transparent,black_30%)] light:block lg:object-[55%_78%]"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 -z-10 h-56 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
      <div className="absolute inset-y-0 left-0 -z-10 w-full bg-gradient-to-r from-bg via-bg/70 to-transparent lg:w-[55%]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-bg/80 to-transparent" />

      <div className="container-page grid items-end gap-12 lg:grid-cols-[1.25fr_1fr] lg:items-start">
        <div className="max-w-2xl">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-line-strong bg-bg/30 px-3.5 py-1.5 text-xs text-muted backdrop-blur-md">
            <span className="size-1.5 animate-pulse-ring rounded-full bg-accent" />
            {h.eyebrow}
          </p>
          <h1 className="font-display text-[3.25rem] leading-[0.95] font-semibold tracking-[-0.035em] text-balance sm:text-7xl lg:text-[5.5rem]">
            {h.title.split(/(?<=[.։])\s*/).map((word, i) => (
              <span key={i} className={i === 1 ? "block text-accent" : "block"}>
                {word}
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">{h.subtitle}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href={href(locale, "/cars")} className={buttonClasses("primary", "lg")}>
              {h.primaryCta}
              <ArrowRight className="size-4" />
            </Link>
            <Link href={href(locale, "/calculator")} className={buttonClasses("secondary", "lg")}>
              <CalcIcon className="size-4" />
              {h.secondaryCta}
            </Link>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-5 gap-y-2.5 text-sm text-muted">
            {h.trust.map((item) => (
              <li key={item} className="inline-flex items-center gap-2">
                <Check className="size-3.5 text-positive" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {sample && (
          <div className="hidden animate-fade-up self-start [animation-delay:200ms] lg:block">
            <HeroPriceCard locale={locale} t={t} sample={sample} />
          </div>
        )}
      </div>
    </section>
  );
}

function HeroPriceCard({ locale, t, sample }: { locale: Locale; t: Dictionary; sample: EstimateResult }) {
  const usd = (n: number) => formatUsd(n, locale);
  return (
    <div className="glass ml-auto max-w-sm rounded-3xl p-6 shadow-2xl light:bg-surface/90 lg:mt-4">
      <div className="flex items-center justify-between text-xs text-subtle">
        <span>2022 Toyota Camry Hybrid · Copart</span>
        <span className="rounded-full bg-fg/5 px-2 py-0.5">{t.common.estimated}</span>
      </div>
      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-xs text-muted">{t.hero.priceCardLabel}</p>
          <p className="tabular mt-1 font-display text-2xl font-semibold text-muted line-through decoration-fg/20">
            {usd(sample.input.price)}
          </p>
        </div>
        <ArrowRight className="mb-2 size-5 text-subtle" />
        <div className="text-right">
          <p className="text-xs text-muted">{t.hero.priceCardTotal}</p>
          <p className="tabular mt-1 font-display text-3xl font-semibold text-positive">{usd(sample.total)}</p>
        </div>
      </div>
      <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-fg/5">
        {sample.lines.map((l) => (
          <span key={l.key} style={{ width: `${(l.amount / sample.total) * 100}%`, background: lineColors[l.key] }} />
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted">
        {sample.lines.slice(1).map((l) => (
          <li key={l.key} className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 truncate">
              <span className="size-1.5 shrink-0 rounded-full" style={{ background: lineColors[l.key] }} />
              <span className="truncate">{t.calculator.lines[l.key]}</span>
            </span>
            <span className="tabular text-fg/80">{usd(l.amount)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-line pt-3 text-[11px] text-subtle">
        {sample.totalAmd ? `${formatAmd(sample.totalAmd, locale)} · ` : ""}
        {t.hero.priceCardNote}
      </p>
    </div>
  );
}
