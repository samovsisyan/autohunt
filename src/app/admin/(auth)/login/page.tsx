import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { AdminLoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/layout/logo";

export const metadata = { title: "Sign in" };

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user?.role === "ADMIN") redirect("/admin");
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm">
        <Logo className="mb-10" />
        <h1 className="font-display text-2xl font-semibold">Admin sign in</h1>
        <p className="mt-2 text-sm text-muted">Manage inventory, imports, calculator rates and content.</p>
        <AdminLoginForm />
        <p className="mt-6 text-center text-xs text-subtle">Demo: admin@autohunt.am / admin1234</p>
      </div>
    </main>
  );
}
