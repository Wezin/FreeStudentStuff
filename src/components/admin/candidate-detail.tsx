"use client";

import { startTransition, useActionState, useEffect } from "react";
import { ArrowClockwise, ArrowLeft, Sparkle, WarningCircle } from "@phosphor-icons/react";
import { AdminListingForm } from "./admin-listing-form";
import { saveListingDraft } from "@/features/listings/actions";
import {
  prepareCandidateDraft,
  type CandidateDraftState,
  type ScanCandidate,
} from "@/features/listings/scan-actions";

const initialState: CandidateDraftState = { status: "idle", error: null };

type CandidateDetailProps = {
  candidate: ScanCandidate;
  pageUrl: string;
  tagSuggestions: string[];
  onBack: () => void;
  onSaved: () => void;
};

/** Loads one scan candidate's full details (re-running the single-link
 *  importer on its own page when it has one) and shows the same review form
 *  as the single-link importer — so the admin can double-check/edit every
 *  field, then save it as pending or approved, before moving to the next. */
export function CandidateDetail({ candidate, pageUrl, tagSuggestions, onBack, onSaved }: CandidateDetailProps) {
  const [state, dispatch, isPending] = useActionState(prepareCandidateDraft, initialState);

  useEffect(() => {
    const formData = new FormData();
    formData.set("candidate_json", JSON.stringify(candidate));
    formData.set("page_url", pageUrl);
    startTransition(() => {
      dispatch(formData);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate.id]);

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to results
      </button>

      {state.status === "idle" || isPending ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowClockwise className="size-4 animate-spin" />
          Loading full details for &quot;{candidate.title}&quot;…
        </div>
      ) : state.status === "error" ? (
        <p className="flex items-center gap-1.5 text-sm text-destructive">
          <WarningCircle className="size-4 shrink-0" />
          {state.error}
        </p>
      ) : state.draft ? (
        <div className="space-y-4">
          {state.draft.usedFullImport ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              <Sparkle className="size-3" weight="fill" />
              Re-read the source page directly for more accurate details
            </span>
          ) : (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              No dedicated page to re-read — using what was found on the directory page
            </span>
          )}
          <AdminListingForm
            key={candidate.id}
            action={saveListingDraft}
            listing={state.draft.listing}
            tagSuggestions={tagSuggestions}
            thumbnailIsExternal
            showApprovalActions
            fieldConfidence={state.draft.fieldConfidence}
            onSaved={onSaved}
          />
        </div>
      ) : null}
    </div>
  );
}
