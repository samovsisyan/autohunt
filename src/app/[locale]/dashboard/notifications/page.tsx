import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formatDate } from "@/i18n/format";
import { requireUser } from "@/server/auth/session";
import { getUserNotifications } from "@/server/services/dashboard.service";
import { markAllReadAction } from "@/server/actions/dashboard";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";

export default async function NotificationsPage({ params }: PageProps<"/[locale]/dashboard/notifications">) {
  const locale = (await params).locale as Locale;
  const user = await requireUser(href(locale, "/login"));
  const [t, items] = await Promise.all([getDictionary(locale), getUserNotifications(user.id)]);
  const unread = items.some((n) => !n.read);
  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold tracking-tight">{t.dashboard.nav.notifications}</h1>
        {unread && (
          <form action={markAllReadAction}>
            <button className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
              <CheckCheck className="size-4" /> {t.dashboard.markAllRead}
            </button>
          </form>
        )}
      </div>
      {items.length ? (
        <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
          {items.map((n) => {
            const body = (
              <div className="flex gap-4 px-5 py-4">
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-accent")} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className={cn("font-medium", n.read && "text-muted")}>{n.title}</p>
                    <time className="shrink-0 text-xs text-subtle">{formatDate(n.createdAt, locale)}</time>
                  </div>
                  <p className="mt-1 text-sm text-muted">{n.body}</p>
                </div>
              </div>
            );
            return <li key={n.id}>{n.link ? <Link href={href(locale, n.link)} className="block hover:bg-fg/[0.02]">{body}</Link> : body}</li>;
          })}
        </ul>
      ) : (
        <EmptyState icon={Bell} title={t.dashboard.empty.notifications} />
      )}
    </div>
  );
}
