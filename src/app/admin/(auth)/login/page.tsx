import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { AdminLoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/layout/logo";
import { AdminLocaleSwitcher } from "@/components/admin/locale-switcher";
import { adminTitle, getAdminT } from "@/i18n/admin";

export const generateMetadata = adminTitle((t) => t.login.metaTitle);

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user?.role === "ADMIN") redirect("/admin");
  const { t } = await getAdminT();
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex items-center justify-between gap-4">
          <Logo />
          <AdminLocaleSwitcher />
        </div>
        <h1 className="font-display text-2xl font-semibold">{t.login.title}</h1>
        <p className="mt-2 text-sm text-muted">{t.login.subtitle}</p>
        <AdminLoginForm />
        <p className="mt-6 text-center text-xs text-subtle">{t.login.demo}</p>
      </div>
    </main>
  );
}
