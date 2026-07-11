import type { Metadata } from "next";
import { ImportWizard } from "@/components/admin/import-wizard";
import { getAllTags } from "@/features/listings/queries";
import { INITIAL_TAGS } from "@/features/listings/constants";

export const metadata: Metadata = {
  title: "Import Listing — Free Plug Admin",
};

export default async function ImportListingPage() {
  const dbTags = await getAllTags();
  const tagSuggestions = [...new Set([...INITIAL_TAGS, ...dbTags])];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Import listing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste a source link to prefill a draft listing, then review and save it as pending or
          approved.
        </p>
      </div>
      <ImportWizard tagSuggestions={tagSuggestions} />
    </div>
  );
}
