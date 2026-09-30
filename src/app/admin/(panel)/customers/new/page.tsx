import { AdminHeader, Panel } from "@/components/admin/ui";
import { NewCustomerForm } from "@/components/admin/customer-forms";

export const metadata = { title: "Add customer" };

export default function NewCustomerPage() {
  return (
    <>
      <AdminHeader title="Add customer" back={{ href: "/admin/customers", label: "Customers" }} />
      <Panel>
        <NewCustomerForm />
      </Panel>
    </>
  );
}
