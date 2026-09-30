import Link from "next/link";
import { db } from "@/server/db";
import { contentBlocks } from "@/server/content-registry";
import { localeLabels, locales, defaultLocale } from "@/i18n/config";
import { AdminHeader, Panel } from "@/components/admin/ui";
import { cn } from "@/lib/cn";

export const metadata = { title: "Languages" };

function Bar({ value, total }: { value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 100;
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
        <div className={cn("h-full rounded-full", pct === 100 ? "bg-positive" : pct > 60 ? "bg-warning" : "bg-danger")} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-20 text-right text-xs tabular text-muted">
        {value}/{total}
      </span>
    </div>
  );
}

export default async function LanguagesAdmin() {
  const [cars, carTr, posts, postTr, content, missingCars, missingPosts] = await Promise.all([
    db.car.count(),
    db.carTranslation.groupBy({ by: ["locale"], where: { description: { not: "" } }, _count: true }),
    db.blogPost.count(),
    db.blogPostTranslation.groupBy({ by: ["locale"], _count: true }),
    db.siteContent.groupBy({ by: ["locale"], _count: true }),
    db.car.findMany({ where: { OR: locales.map((l) => ({ translations: { none: { locale: l, description: { not: "" } } } })) }, select: { id: true, year: true, brand: true, model: true, translations: { select: { locale: true, description: true } } }, take: 20 }),
    db.blogPost.findMany({ where: { OR: locales.map((l) => ({ translations: { none: { locale: l } } })) }, select: { id: true, translations: { select: { locale: true, title: true } } }, take: 20 }),
  ]);
  const count = (arr: { locale: string; _count: number }[], l: string) => arr.find((x) => x.locale === l)?._count ?? 0;

  return (
    <>
      <AdminHeader
        title="Languages"
        description={`The site is published in ${locales.map((l) => localeLabels[l].name).join(", ")} at /hy, /ru and /en with hreflang alternates. Default: ${localeLabels[defaultLocale].name}. Interface text lives in src/i18n/dictionaries; content below is managed here.`}
      />
      <div className="grid gap-4 md:grid-cols-3">
        {locales.map((l) => (
          <Panel key={l} title={`${localeLabels[l].name} · /${l}`}>
            <div className="space-y-4 text-sm">
              <div>
                <p className="mb-1.5 text-muted">Car descriptions</p>
                <Bar value={count(carTr, l)} total={cars} />
              </div>
              <div>
                <p className="mb-1.5 text-muted">Blog articles</p>
                <Bar value={count(postTr, l)} total={posts} />
              </div>
              <div>
                <p className="mb-1.5 text-muted">Customized page blocks</p>
                <Bar value={count(content, l)} total={contentBlocks.length} />
              </div>
            </div>
          </Panel>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Cars missing a translation">
          <ul className="-my-2 divide-y divide-line text-sm">
            {missingCars.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2.5">
                <Link href={`/admin/cars/${c.id}`} className="hover:text-accent">
                  {c.year} {c.brand} {c.model}
                </Link>
                <span className="flex gap-1">
                  {locales
                    .filter((l) => !c.translations.some((t) => t.locale === l && t.description))
                    .map((l) => (
                      <span key={l} className="rounded bg-warning-soft px-1.5 text-[10px] text-warning uppercase">
                        {l}
                      </span>
                    ))}
                </span>
              </li>
            ))}
            {!missingCars.length && <li className="py-2.5 text-positive">All cars are translated.</li>}
          </ul>
        </Panel>
        <Panel title="Articles missing a translation">
          <ul className="-my-2 divide-y divide-line text-sm">
            {missingPosts.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2.5">
                <Link href={`/admin/blog/${p.id}`} className="hover:text-accent">
                  {p.translations[0]?.title ?? "(untitled)"}
                </Link>
                <span className="flex gap-1">
                  {locales
                    .filter((l) => !p.translations.some((t) => t.locale === l))
                    .map((l) => (
                      <span key={l} className="rounded bg-warning-soft px-1.5 text-[10px] text-warning uppercase">
                        {l}
                      </span>
                    ))}
                </span>
              </li>
            ))}
            {!missingPosts.length && <li className="py-2.5 text-positive">All articles are translated.</li>}
          </ul>
        </Panel>
      </div>
    </>
  );
}
