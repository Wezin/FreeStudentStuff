"use client";

import { useActionState } from "react";
import { ArrowClockwise, LinkSimple, Sparkle, WarningCircle } from "@phosphor-icons/react";
import { AdminListingForm } from "./admin-listing-form";
import { createListing } from "@/features/listings/actions";
import { importListingFromUrl, type ImportActionState } from "@/features/listings/import-actions";
import type { Listing } from "@/features/listings/types";

const initialState: ImportActionState = { status: "idle", error: null };

type ImportWizardProps = {
  tagSuggestions: string[];
};

export function ImportWizard({ tagSuggestions }: ImportWizardProps) {
  const [state, formAction, isPending] = useActionState(importListingFromUrl, initialState);

  return (
    <div className="max-w-2xl space-y-8">
      <form action={formAction} className="space-y-2">
        <label htmlFor="import_url" className="text-sm font-medium text-foreground">
          Source URL
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-input bg-transparent px-3 py-2 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
            <LinkSimple className="size-4 shrink-0 text-muted-foreground" />
            <input
              id="import_url"
              name="import_url"
              type="url"
              placeholder="https://example.com/event-or-deal"
              required
              className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <ArrowClockwise className="size-4 animate-spin" />
                Fetching…
              </>
            ) : (
              "Fetch & extract"
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Paste a link to an event page, deal page, or opportunity listing. We&apos;ll try to pull
          out the title, description, dates, image, and host — then you can review and fix
          anything before saving.
        </p>
        {state.status === "error" && (
          <p className="flex items-center gap-1.5 text-sm text-destructive">
            <WarningCircle className="size-4 shrink-0" />
            {state.error}
          </p>
        )}
      </form>

      {state.status === "success" && state.result && (
        <div className="space-y-6 border-t border-border pt-6">
          <ConfidenceSummary
            found={state.result.confidence.found}
            total={state.result.confidence.total}
            score={state.result.confidence.score}
            usedLlm={state.result.usedLlm}
          />

          <AdminListingForm
            key={state.result.finalUrl}
            action={createListing}
            tagSuggestions={tagSuggestions}
            thumbnailIsExternal
            showApprovalActions
            fieldConfidence={state.result.confidence.checks}
            listing={draftToListing(state.result)}
          />
        </div>
      )}
    </div>
  );
}

function ConfidenceSummary({
  found,
  total,
  score,
  usedLlm,
}: {
  found: number;
  total: number;
  score: number;
  usedLlm: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
      <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {score}%
      </div>
      <div className="text-sm">
        <p className="flex flex-wrap items-center gap-2 font-medium text-foreground">
          {found} of {total} fields found automatically
          {usedLlm ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              <Sparkle className="size-3" weight="fill" />
              Read by Gemini
            </span>
          ) : (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              Basic parsing only — set GEMINI_API_KEY for better extraction
            </span>
          )}
        </p>
        <p className="text-muted-foreground">
          Review the highlighted fields below — anything marked &quot;Not found&quot; needs your
          input.
        </p>
      </div>
    </div>
  );
}

function draftToListing(result: NonNullable<ImportActionState["result"]>): Partial<Listing> {
  return {
    title: result.title,
    description: result.description,
    listing_type: result.listingType,
    location: result.location || null,
    starts_at: result.startsAt || null,
    ends_at: result.endsAt || null,
    tags: result.tags,
    thumbnail_url: result.imageUrl || undefined,
    source_url: result.finalUrl,
    cta_label: result.ctaLabel,
    establishment_id: result.establishmentId,
    establishment_name: result.establishmentName,
  };
}
