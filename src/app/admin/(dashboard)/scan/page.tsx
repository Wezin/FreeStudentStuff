import type { Metadata } from "next";
import { ScanWizard } from "@/components/admin/scan-wizard";
import { getAllTags } from "@/features/listings/queries";
import { INITIAL_TAGS } from "@/features/listings/constants";

export const metadata: Metadata = {
  title: "Scan Source Page — Free Plug Admin",
};

// Analyzing a large directory page can take Gemini a while (a big page with
// 40-50 candidate blocks has taken 60-100s in testing). A scan now also
// follows a listing's own pagination up to 12 pages deep (fetched
// sequentially, then analyzed with one LLM call per page in parallel) —
// extend well past the platform default so a deep scan isn't cut off
// mid-way. Lower this if your Vercel plan doesn't allow it.
export const maxDuration = 280;

export default async function ScanPage() {
  const dbTags = await getAllTags();
  const tagSuggestions = [...new Set([...INITIAL_TAGS, ...dbTags])];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Scan source page</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste a directory-style page — an events calendar, a deals page, a discounts list —
          and find individual listings to review and import as pending.
        </p>
      </div>
      <ScanWizard tagSuggestions={tagSuggestions} />
    </div>
  );
}
