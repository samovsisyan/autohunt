import Link from "next/link";
import { Inbox } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formatDate } from "@/i18n/format";
import { requireUser } from "@/server/auth/session";
import { getUserRequests } from "@/server/services/dashboard.service";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/badge";

export default async function RequestsPage({ params }: PageProps<"/[locale]/dashboard/requests">) {
  const locale = (await params).locale as Locale;
  const user = await requireUser(href(locale, "/login"));
  const [t, requests] = await Promise.all([getDictionary(locale), getUserRequests(user.id)]);
  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-semibold tracking-tight">{t.dashboard.nav.requests}</h1>
      {requests.length ? (
        <ul className="space-y-3">
          {requests.map((r) => (
            <li key={r.id} className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium">
                  {t.enums.requestType[r.type]}
                  {r.car && (
                    <>
                      {" · "}
                      <Link href={href(locale, `/cars/${r.car.slug}`)} className="text-accent hover:underline">
                        {r.car.year} {r.car.brand} {r.car.model}
                      </Link>
                    </>
                  )}
                </p>
                {r.message && <p className="mt-1 line-clamp-2 text-sm text-muted">{r.message}</p>}
                <p className="mt-1 text-xs text-subtle">{formatDate(r.createdAt, locale)}</p>
              </div>
              <StatusBadge status={r.status} label={t.enums.requestStatus[r.status]} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={Inbox} title={t.dashboard.empty.requests} />
      )}
    </div>
  );
}
