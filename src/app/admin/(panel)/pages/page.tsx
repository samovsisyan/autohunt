import Link from "next/link";
import { db } from "@/server/db";
import { getDictionary } from "@/i18n/dictionaries";
import { contentBlocks } from "@/server/content-registry";
import { AdminHeader, Panel } from "@/components/admin/ui";
import { ContentEditor } from "@/components/admin/content-editor";
import { cn } from "@/lib/cn";

export const metadata = { title: "Pages" };

export default async function PagesAdmin({ searchParams }: { searchParams: Promise<{ key?: string; locale?: string }> }) {
  const sp = await searchParams;
  const block = contentBlocks.find((b) => b.key === sp.key) ?? contentBlocks[0];
  const locale = (["hy", "ru", "en"] as const).find((l) => l === sp.locale) ?? "hy";
  const [t, row, overrides] = await Promise.all([
    getDictionary(locale),
    db.siteContent.findUnique({ where: { key_locale: { key: block.key, locale } } }),
    db.siteContent.findMany({ select: { key: true, locale: true } }),
  ]);
  const value = { ...block.defaults(t), ...((row?.data as object) ?? {}) };

  return (
    <>
      <AdminHeader title="Pages" description="Homepage sections and site-wide content, per language. Changes publish immediately." />
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <nav className="space-y-1 lg:sticky lg:top-8 lg:self-start">
          {contentBlocks.map((b) => (
            <Link key={b.key} href={`/admin/pages?key=${b.key}&locale=${locale}`} className={cn("block rounded-lg px-3 py-2.5 text-sm", b.key === block.key ? "bg-white/[0.07] text-fg" : "text-muted hover:text-fg")}>
              {b.title}
              <span className="mt-1 flex gap-1">
                {(["hy", "ru", "en"] as const).map((l) => (
                  <span key={l} className={cn("rounded px-1 text-[9px] uppercase", overrides.some((o) => o.key === b.key && o.locale === l) ? "bg-accent-soft text-accent" : "bg-white/5 text-subtle")}>
                    {l}
                  </span>
                ))}
              </span>
            </Link>
          ))}
        </nav>
        <Panel
          title={block.title}
          description={block.description}
          actions={
            <div className="flex gap-1">
              {(["hy", "ru", "en"] as const).map((l) => (
                <Link key={l} href={`/admin/pages?key=${block.key}&locale=${l}`} className={cn("h-8 rounded-full border px-3 text-xs leading-8 uppercase", l === locale ? "border-accent/50 bg-accent-soft text-fg" : "border-line text-muted")}>
                  {l}
                </Link>
              ))}
            </div>
          }
        >
          <ContentEditor key={`${block.key}-${locale}`} contentKey={block.key} locale={locale} initial={value as never} overridden={!!row} />
        </Panel>
      </div>
    </>
  );
}
