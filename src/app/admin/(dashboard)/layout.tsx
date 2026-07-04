import { requireAdmin } from "@/features/admin/auth";
import { AdminShell } from "@/components/admin/admin-layout";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return <AdminShell>{children}</AdminShell>;
}
