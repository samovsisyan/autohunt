import type { Metadata } from "next";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { requireUser } from "@/server/auth/session";
import { countUnread } from "@/server/services/dashboard.service";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DashboardLayout({ children, params }: LayoutProps<"/[locale]/dashboard">) {
  const locale = (await params).locale as Locale;
  // Defense in depth: proxy.ts already redirects anonymous users.
  const user = await requireUser(href(locale, "/login"));
  const [t, unread] = await Promise.all([getDictionary(locale), countUnread(user.id)]);

  return (
    <div className="container-page pt-24 pb-24 sm:pt-28">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-5 hidden items-center gap-3 rounded-2xl border border-line bg-surface p-4 lg:flex">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent/30 to-positive/30 font-display font-semibold">
              {user.name.slice(0, 1)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">{user.name}</p>
              <p className="truncate text-xs text-subtle">{user.email}</p>
            </div>
          </div>
          {user.role === "CORPORATE" && <Badge tone="accent" className="mb-3 hidden lg:inline-flex">{user.companyName ?? t.auth.corporate}</Badge>}
          <DashboardNav base={href(locale, "/dashboard")} labels={t.dashboard.nav} unread={unread} />
          <div className="mt-4 hidden border-t border-line pt-4 lg:block">
            <LogoutButton label={t.auth.logout} locale={locale} />
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
