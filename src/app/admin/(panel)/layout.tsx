import { requireAdmin } from "@/server/auth/session";
import { db } from "@/server/db";
import { AdminNav } from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  // Defense in depth: proxy.ts already gates /admin by role.
  const user = await requireAdmin();
  const newRequests = await db.request.count({ where: { status: "NEW" } });
  return (
    <div className="min-h-dvh">
      <AdminNav user={user} badges={{ requests: newRequests }} />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
