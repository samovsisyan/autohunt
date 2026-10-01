import { AdminHeader, Panel } from "@/components/admin/ui";
import { NewCustomerForm } from "@/components/admin/customer-forms";
import { adminTitle, getAdminT } from "@/i18n/admin";

export const generateMetadata = adminTitle((t) => t.customers.add);

export default async function NewCustomerPage() {
  const { t } = await getAdminT();
  return (
    <>
      <AdminHeader title={t.customers.add} back={{ href: "/admin/customers", label: t.customers.title }} />
      <Panel>
        <NewCustomerForm />
      </Panel>
    </>
  );
}
