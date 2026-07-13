"use server";

import { requireAdmin } from "@/features/admin/auth";
import { fetchPage, isFetchPageError } from "@/lib/import/fetch-page";
import { extractCandidateBlocks } from "@/lib/import/scan-blocks";
import { findNextPageUrl } from "@/lib/import/find-next-page";
import { extractListingDraft } from "@/lib/import/extract";
import { analyzePageForCandidates } from "@/lib/import/scan-llm";
import { extractListingFromUrl, ImportUrlError } from "@/lib/import/import-url";
import { computeConfidence } from "@/lib/import/guess";
import { getAllListingSourceUrls } from "./queries";
import type { ImportConfidence, Listing, ListingType } from "./types";

// Bounded, not a crawler: follows a directory listing's own rel="next"
// pagination — the same list, split across pages, or a calendar's
// month-by-month navigation — up to this many pages total, so a scan
// doesn't silently miss events/deals sitting several pages/months deep.
const MAX_PAGES = 12;
// Overall cap across every page combined, applied after everything's
// resolved — mainly to keep the review list and the per-candidate image
// backfill from ballooning on an unusually large paginated listing.
const MAX_TOTAL_CANDIDATES = 100;

/**
 * Normalizes a URL for duplicate comparison — the single-link importer can
 * follow a redirect (http -> https, a trailing slash, a canonical path) when
 * it actually saves a listing, so the URL stored on that listing can differ
 * from the raw link a later scan finds on the same source page. Comparing
 * host+path+query (ignoring scheme, "www.", and a trailing slash) catches
 * that without needing exact string equality.
 */
function normalizeUrlForDedup(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const path = parsed.pathname.replace(/\/+$/, "");
    return `${host}${path}${parsed.search}`.toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

export type ScanCandidate = {
  id: string;
  title: string;
  description: string;
  sourceUrl: string | null;
  imageUrl: string | null;
  listingType: ListingType;
  startsAt: string;
  endsAt: string;
  location: string;
  establishmentId: string | null;
  establishmentName: string;
  tags: string[];
  ctaLabel: string;
  confidence: ImportConfidence;
  isDuplicate: boolean;
};

export type ScanActionState = {
  status: "idle" | "success" | "error";
  error: string | null;
  pageUrl?: string;
  candidates?: ScanCandidate[];
};

export async function scanSourcePage(
  _prevState: ScanActionState,
  formData: FormData,
): Promise<ScanActionState> {
  await requireAdmin();

  const rawUrl = formData.get("scan_url");
  if (typeof rawUrl !== "string" || !rawUrl.trim()) {
    return { status: "error", error: "Paste a URL to scan." };
  }

  if (!process.env.GEMINI_API_KEY) {
    return {
      status: "error",
      error:
        "The page scanner needs GEMINI_API_KEY configured to identify candidates — the " +
        "single-link importer still works without it.",
    };
  }

  let firstHtml: string;
  let finalUrl: string;
  try {
    const page = await fetchPage(rawUrl.trim());
    firstHtml = page.html;
    finalUrl = page.finalUrl;
  } catch (err) {
    if (isFetchPageError(err)) return { status: "error", error: err.message };
    return { status: "error", error: "Could not fetch that page." };
  }

  // Follow rel="next" pagination (bounded — see MAX_PAGES) so a directory
  // listing split across page 2, 3, etc. doesn't lose everything past page 1.
  const pages: { html: string; url: string }[] = [{ html: firstHtml, url: finalUrl }];
  const visitedPageUrls = new Set([normalizeUrlForDedup(finalUrl)]);
  let nextPageUrl = findNextPageUrl(firstHtml, finalUrl);

  while (nextPageUrl && pages.length < MAX_PAGES) {
    const normalizedNext = normalizeUrlForDedup(nextPageUrl);
    if (visitedPageUrls.has(normalizedNext)) break; // pagination loop guard
    visitedPageUrls.add(normalizedNext);

    try {
      const page = await fetchPage(nextPageUrl);
      pages.push({ html: page.html, url: page.finalUrl });
      nextPageUrl = findNextPageUrl(page.html, page.finalUrl);
    } catch {
      break; // couldn't fetch the next page — use what we already have
    }
  }

  // Each page gets its own bounded block list and its own LLM call, run in
  // parallel — this is what lets a scan go many pages deep without the
  // prompt size (and latency) of a single call multiplying by page count.
  const perPageResults = await Promise.all(
    pages.map(async (p) => {
      const blocks = extractCandidateBlocks(p.html, p.url);
      const analysis = await analyzePageForCandidates(p.html, blocks, p.url);
      return { blocks, analysis };
    }),
  );

  // Resolve each candidate's block reference to a real URL/image ourselves
  // (never trust a URL string the model might have typed out), and dedupe
  // by resolved source URL across every page combined.
  type PreConfidence = Omit<ScanCandidate, "isDuplicate" | "confidence">;
  const seenUrls = new Set<string>();
  const preliminary: PreConfidence[] = [];

  for (const { blocks, analysis } of perPageResults) {
    if (!analysis) continue;

    for (const candidate of analysis) {
      const title = candidate.title.trim();
      if (!title) continue;

      const block = candidate.block_index != null ? blocks[candidate.block_index - 1] : undefined;
      const sourceUrl = block?.href ?? null;

      if (sourceUrl) {
        if (seenUrls.has(sourceUrl)) continue;
        seenUrls.add(sourceUrl);
      }

      preliminary.push({
        id: crypto.randomUUID(),
        title,
        description: candidate.description ?? "",
        sourceUrl,
        imageUrl: block?.imageUrl ?? null,
        listingType: candidate.listing_type,
        startsAt: candidate.starts_at ?? "",
        endsAt: candidate.ends_at ?? "",
        location: candidate.location ?? "",
        establishmentId: candidate.establishment_id,
        establishmentName: candidate.establishment_name ?? "",
        tags: candidate.tags,
        ctaLabel: candidate.cta_label || (candidate.listing_type === "deal" ? "Claim Deal" : "View Event"),
      });
    }
  }

  if (preliminary.length === 0) {
    return {
      status: "error",
      error:
        "Couldn't find any likely listings on that page. If it's about one specific event " +
        "or deal, try the single-link importer instead.",
    };
  }

  preliminary.splice(MAX_TOTAL_CANDIDATES);

  // Directory-page cards often don't nest an <img> right next to their link
  // (background images, lazy-loaded thumbnails, layouts our block extractor
  // can't reliably parse), so a candidate can come out of the block match
  // with no image even though its own page clearly has one. Backfill those
  // by fetching each such candidate's page directly — plain HTTP + mechanical
  // JSON-LD/OG parsing, the same as the single-link importer's image step,
  // so this costs no AI quota — in parallel so it doesn't multiply latency.
  const withImages = await Promise.all(
    preliminary.map(async (candidate) => {
      if (candidate.imageUrl || !candidate.sourceUrl) return candidate;
      try {
        const page = await fetchPage(candidate.sourceUrl);
        const draft = extractListingDraft(page.html, page.finalUrl);
        return draft.image_url ? { ...candidate, imageUrl: draft.image_url } : candidate;
      } catch {
        return candidate;
      }
    }),
  );

  const existingUrls = await getAllListingSourceUrls();
  const existingNormalized = new Set(existingUrls.map(normalizeUrlForDedup));

  const candidates: ScanCandidate[] = withImages.map((c) => ({
    ...c,
    confidence: computeConfidence({
      title: c.title,
      description: c.description || null,
      location: c.location || null,
      starts_at: c.startsAt || null,
      ends_at: c.endsAt || null,
      image_url: c.imageUrl,
      tags: c.tags,
      establishment_name: c.establishmentName || null,
    }),
    isDuplicate: c.sourceUrl ? existingNormalized.has(normalizeUrlForDedup(c.sourceUrl)) : false,
  }));

  return { status: "success", error: null, pageUrl: finalUrl, candidates };
}

// ---------------------------------------------------------------------------

export type CandidateDraft = {
  listing: Partial<Listing>;
  fieldConfidence: ImportConfidence["checks"];
  /** Whether this came from re-running the full single-link importer on the
   *  candidate's own page (richer) or just the scan's own terse block data
   *  (candidate had no link of its own, or its page couldn't be fetched). */
  usedFullImport: boolean;
};

export type CandidateDraftState = {
  status: "idle" | "success" | "error";
  error: string | null;
  draft?: CandidateDraft;
};

/**
 * Prepares one scan candidate for review in the full listing form. If it has
 * its own source URL, this re-runs the existing single-link importer on that
 * URL for a much richer extraction than the directory page's brief card text
 * could give; otherwise (or if that page can't be fetched) it falls back to
 * the scan's own extracted data, using the scanned directory page itself as
 * the source URL (the listing schema requires one).
 */
export async function prepareCandidateDraft(
  _prevState: CandidateDraftState,
  formData: FormData,
): Promise<CandidateDraftState> {
  await requireAdmin();

  const raw = formData.get("candidate_json");
  const pageUrl = formData.get("page_url");
  if (typeof raw !== "string" || !raw || typeof pageUrl !== "string" || !pageUrl) {
    return { status: "error", error: "Missing candidate data — try scanning again." };
  }

  let candidate: ScanCandidate;
  try {
    candidate = JSON.parse(raw);
  } catch {
    return { status: "error", error: "Something went wrong reading this candidate — try scanning again." };
  }

  if (candidate.sourceUrl) {
    try {
      const full = await extractListingFromUrl(candidate.sourceUrl);
      return {
        status: "success",
        error: null,
        draft: {
          listing: {
            title: full.title || candidate.title,
            description: full.description || candidate.description,
            listing_type: full.listingType,
            location: full.location || candidate.location || null,
            starts_at: full.startsAt || candidate.startsAt || null,
            ends_at: full.endsAt || candidate.endsAt || null,
            tags: full.tags.length > 0 ? full.tags : candidate.tags,
            thumbnail_url: full.imageUrl || candidate.imageUrl || undefined,
            source_url: full.finalUrl,
            cta_label: full.ctaLabel || candidate.ctaLabel,
            establishment_id: full.establishmentId ?? candidate.establishmentId,
            establishment_name: full.establishmentName || candidate.establishmentName,
          },
          fieldConfidence: full.confidence.checks,
          usedFullImport: true,
        },
      };
    } catch (err) {
      if (!(err instanceof ImportUrlError)) throw err;
      // Fall through to the scan's own data below rather than dead-ending.
    }
  }

  return {
    status: "success",
    error: null,
    draft: {
      listing: {
        title: candidate.title,
        description: candidate.description,
        listing_type: candidate.listingType,
        location: candidate.location || null,
        starts_at: candidate.startsAt || null,
        ends_at: candidate.endsAt || null,
        tags: candidate.tags,
        thumbnail_url: candidate.imageUrl || undefined,
        source_url: candidate.sourceUrl || pageUrl,
        cta_label: candidate.ctaLabel,
        establishment_id: candidate.establishmentId,
        establishment_name: candidate.establishmentName,
      },
      fieldConfidence: candidate.confidence.checks,
      usedFullImport: false,
    },
  };
}
