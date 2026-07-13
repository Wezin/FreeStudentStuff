"use client";

import { useState } from "react";
import Image from "next/image";
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react";
import { CandidateDetail } from "./candidate-detail";
import type { ScanCandidate } from "@/features/listings/scan-actions";
import { cn } from "@/lib/utils";

// Caps how many candidates render at once — a big directory scan (or one
// that pulled in several paginated pages) can easily return 40-50+
// candidates, which is a lot of scrolling in one long list.
const PAGE_SIZE = 10;

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  description: "Description",
  location: "Location",
  starts_at: "Start date",
  ends_at: "End date",
  image_url: "Image",
  tags: "Tags",
  establishment_name: "Host",
};

function missingFields(candidate: ScanCandidate): string[] {
  return Object.entries(candidate.confidence.checks)
    .filter(([, found]) => !found)
    .map(([key]) => FIELD_LABELS[key] ?? key);
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

type CandidateReviewProps = {
  candidates: ScanCandidate[];
  pageUrl: string;
  tagSuggestions: string[];
};

/**
 * Lists every candidate the scan found; opening one loads its full details
 * (CandidateDetail) into the same real listing form used elsewhere in
 * admin, so each candidate is reviewed and saved — as pending or approved —
 * one at a time, rather than blind-importing a batch of AI guesses.
 */
export function CandidateReview({ candidates: initialCandidates, pageUrl, tagSuggestions }: CandidateReviewProps) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [openId, setOpenId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);

  function ignore(id: string) {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  }

  const openCandidate = candidates.find((c) => c.id === openId) ?? null;
  const totalPages = Math.max(1, Math.ceil(candidates.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const visibleCandidates = candidates.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  if (openCandidate) {
    return (
      <CandidateDetail
        candidate={openCandidate}
        pageUrl={pageUrl}
        tagSuggestions={tagSuggestions}
        onBack={() => setOpenId(null)}
        onSaved={() => {
          setSavedIds((prev) => new Set(prev).add(openCandidate.id));
          setOpenId(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Found {candidates.length} possible listing{candidates.length === 1 ? "" : "s"} on this page. Open one to
        review the full details before saving it — each is saved individually, as pending or approved.
      </p>

      <div className="space-y-3">
        {visibleCandidates.map((candidate) => {
          const missing = missingFields(candidate);
          const isSaved = savedIds.has(candidate.id);
          const isBlocked = candidate.isDuplicate || isSaved;

          return (
            <div
              key={candidate.id}
              className={cn("flex gap-3 rounded-lg border border-border p-3", isBlocked && "opacity-60")}
            >
              <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-md bg-muted sm:w-36">
                {candidate.imageUrl ? (
                  <Image src={candidate.imageUrl} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full items-center justify-center text-center text-[10px] text-muted-foreground">
                    No image
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">{candidate.title}</p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                    {candidate.listingType}
                  </span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    {candidate.confidence.score}%
                  </span>
                  {isSaved && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      Saved
                    </span>
                  )}
                  {candidate.isDuplicate && !isSaved && (
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                      Already imported
                    </span>
                  )}
                </div>

                <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                  <span>{formatDate(candidate.startsAt)}</span>
                  <span>{candidate.location || "Online / not specified"}</span>
                  <span>{candidate.establishmentName || "Unknown host"}</span>
                </p>

                {candidate.sourceUrl && (
                  <a
                    href={candidate.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-xs text-primary hover:underline"
                  >
                    {candidate.sourceUrl}
                  </a>
                )}

                {missing.length > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    Quick estimate from the directory page alone — missing: {missing.join(", ")}. Open it for the
                    full picture.
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpenId(candidate.id)}
                  disabled={isBlocked}
                  className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaved ? "Saved" : "Review & save"}
                </button>
                <button
                  type="button"
                  onClick={() => ignore(candidate.id)}
                  aria-label={`Ignore ${candidate.title}`}
                  className="rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <CaretLeft className="size-3.5" />
            Previous
          </button>
          <span className="text-xs text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            Next
            <CaretRight className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
