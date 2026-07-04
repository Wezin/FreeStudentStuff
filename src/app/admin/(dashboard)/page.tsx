import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react/ssr";
import { AdminStats } from "@/components/admin/admin-stats";
import { AdminListingsTable } from "@/components/admin/admin-listings-table";
import { AdminSubmissionsTable } from "@/components/admin/admin-submissions-table";
import { getAdminListings, getAdminListingStats } from "@/features/listings/queries";
import { getAdminSubmissions } from "@/features/submissions/queries";

export const metadata: Metadata = {
  title: "Admin Dashboard — Free Plug",
};

export default async function AdminDashboardPage() {
  const [listings, stats, submissions] = await Promise.all([
    getAdminListings(),
    getAdminListingStats(),
    getAdminSubmissions(),
  ]);

  const pendingSubmissions = submissions.filter((s) => s.status === "pending").length;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage listings and review student submissions.
        </p>
      </div>

      <AdminStats stats={stats} pendingSubmissions={pendingSubmissions} />

      <section id="listings" className="space-y-4 scroll-mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Listings</h2>
          <Link
            href="/admin/listings/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="size-4" />
            New Listing
          </Link>
        </div>
        <AdminListingsTable listings={listings} />
      </section>

      <section id="submissions" className="space-y-4 scroll-mt-6">
        <h2 className="text-lg font-semibold tracking-tight">Submissions</h2>
        <AdminSubmissionsTable submissions={submissions} />
      </section>
    </div>
  );
}
