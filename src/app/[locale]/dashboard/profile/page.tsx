import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { requireUser } from "@/server/auth/session";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { LogoutButton } from "@/components/dashboard/logout-button";

export default async function ProfilePage({ params }: PageProps<"/[locale]/dashboard/profile">) {
  const locale = (await params).locale as Locale;
  const user = await requireUser(href(locale, "/login"));
  const t = await getDictionary(locale);
  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 font-display text-3xl font-semibold tracking-tight">{t.dashboard.nav.profile}</h1>
      <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <ProfileForm
          user={user}
          labels={{ ...t.forms, save: t.common.save, saved: t.dashboard.profileSaved, error: t.common.error, language: t.nav.language, taxId: "Tax ID / ՀՎՀՀ / ИНН" }}
        />
      </div>
      <div className="mt-6 lg:hidden">
        <LogoutButton label={t.auth.logout} locale={locale} className="justify-center border border-line" />
      </div>
    </div>
  );
}
