import type { Metadata } from "next";
import { Lightning } from "@phosphor-icons/react/ssr";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Admin Login — Free Plug",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
      <div className="flex items-center gap-2 text-xl font-semibold tracking-tight">
        <Lightning weight="fill" className="size-6 text-primary" />
        Free Plug Admin
      </div>
      <AdminLoginForm />
    </div>
  );
}
