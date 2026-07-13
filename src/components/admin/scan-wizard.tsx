"use client";

import { useActionState } from "react";
import { ArrowClockwise, MagnifyingGlass, WarningCircle } from "@phosphor-icons/react";
import { scanSourcePage, type ScanActionState } from "@/features/listings/scan-actions";
import { CandidateReview } from "./candidate-review";

const initialState: ScanActionState = { status: "idle", error: null };

type ScanWizardProps = {
  tagSuggestions: string[];
};

export function ScanWizard({ tagSuggestions }: ScanWizardProps) {
  const [state, formAction, isPending] = useActionState(scanSourcePage, initialState);

  return (
    <div className="max-w-3xl space-y-8">
      <form action={formAction} className="space-y-2">
        <label htmlFor="scan_url" className="text-sm font-medium text-foreground">
          Source page URL
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-input bg-transparent px-3 py-2 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
            <MagnifyingGlass className="size-4 shrink-0 text-muted-foreground" />
            <input
              id="scan_url"
              name="scan_url"
              type="url"
              placeholder="https://example.com/events or /deals"
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
                Scanning…
              </>
            ) : (
              "Scan page"
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Paste a directory-style page — a school events calendar, a student discounts page, a
          deals category page — and we&apos;ll look for individual events/deals on it. This only
          scans the one page you paste, not the whole site, and nothing is published
          automatically.
        </p>
        {state.status === "error" && (
          <p className="flex items-center gap-1.5 text-sm text-destructive">
            <WarningCircle className="size-4 shrink-0" />
            {state.error}
          </p>
        )}
      </form>

      {state.status === "success" && state.candidates && (
        <div className="border-t border-border pt-6">
          <CandidateReview
            key={state.pageUrl}
            candidates={state.candidates}
            pageUrl={state.pageUrl ?? ""}
            tagSuggestions={tagSuggestions}
          />
        </div>
      )}
    </div>
  );
}
