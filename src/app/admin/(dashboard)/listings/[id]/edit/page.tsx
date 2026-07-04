import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminListingForm } from "@/components/admin/admin-listing-form";
import { updateListing } from "@/features/listings/actions";
import { getAdminListingById, getAllTags } from "@/features/listings/queries";
import { INITIAL_TAGS } from "@/features/listings/constants";

export const metadata: Metadata = {
  title: "Edit Listing — Free Plug Admin",
};

type EditListingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  const [listing, dbTags] = await Promise.all([getAdminListingById(id), getAllTags()]);

  if (!listing) {
    notFound();
  }

  const tagSuggestions = [...new Set([...INITIAL_TAGS, ...dbTags])];
  const updateListingWithId = updateListing.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Listing</h1>
        <p className="mt-1 text-sm text-muted-foreground">{listing.title}</p>
      </div>
      <AdminListingForm action={updateListingWithId} listing={listing} tagSuggestions={tagSuggestions} />
    </div>
  );
}
