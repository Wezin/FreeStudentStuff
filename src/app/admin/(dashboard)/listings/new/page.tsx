import type { Metadata } from "next";
import { AdminListingForm } from "@/components/admin/admin-listing-form";
import { createListing } from "@/features/listings/actions";
import { getAllTags } from "@/features/listings/queries";
import { INITIAL_TAGS } from "@/features/listings/constants";

export const metadata: Metadata = {
  title: "New Listing — Free Plug Admin",
};

export default async function NewListingPage() {
  const dbTags = await getAllTags();
  const tagSuggestions = [...new Set([...INITIAL_TAGS, ...dbTags])];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Listing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          New listings are created as drafts — publish from the dashboard when ready.
        </p>
      </div>
      <AdminListingForm action={createListing} tagSuggestions={tagSuggestions} />
    </div>
  );
}
