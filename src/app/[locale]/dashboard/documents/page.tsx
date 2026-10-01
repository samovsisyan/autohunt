import { FileText, Download } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formatDate } from "@/i18n/format";
import { requireUser } from "@/server/auth/session";
import { getUserDocuments } from "@/server/services/dashboard.service";
import { EmptyState } from "@/components/ui/empty-state";

export default async function DocumentsPage({ params }: PageProps<"/[locale]/dashboard/documents">) {
  const locale = (await params).locale as Locale;
  const user = await requireUser(href(locale, "/login"));
  const [t, docs] = await Promise.all([getDictionary(locale), getUserDocuments(user.id)]);
  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-semibold tracking-tight">{t.dashboard.nav.documents}</h1>
      {docs.length ? (
        <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
          {docs.map((d) => (
            <li key={d.id}>
              <a href={d.url} target="_blank" rel="noopener" className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-fg/[0.02]">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-fg/5 text-accent">
                  <FileText className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{d.title}</p>
                  <p className="truncate text-xs text-subtle">
                    {t.enums.docType[d.type]}
                    {d.import && ` · ${d.import.vehicleTitle} · ${d.import.code}`}
                  </p>
                </div>
                <span className="hidden text-xs text-subtle sm:block">{formatDate(d.createdAt, locale)}</span>
                <Download className="size-4 shrink-0 text-subtle" aria-label={t.dashboard.download} />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={FileText} title={t.dashboard.empty.documents} />
      )}
    </div>
  );
}
