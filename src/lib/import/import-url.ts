import "server-only";
import { fetchPage, isFetchPageError } from "./fetch-page";
import { extractListingDraft } from "./extract";
import { extractWithLlm } from "./llm-extract";
import { guessEstablishment, guessListingType, guessTags, computeConfidence } from "./guess";
import type { ImportConfidence, ListingType } from "@/features/listings/types";

export type ImportedListingDraft = {
  finalUrl: string;
  title: string;
  description: string;
  location: string;
  listingType: ListingType;
  startsAt: string;
  endsAt: string;
  tags: string[];
  imageUrl: string;
  establishmentId: string | null;
  establishmentName: string;
  ctaLabel: string;
  confidence: ImportConfidence;
  /** Whether Gemini produced this draft, or it fell back to mechanical
   *  JSON-LD/OG parsing + keyword guessing (no GEMINI_API_KEY, or the
   *  call failed). Surfaced so the review form can hint at extra scrutiny. */
  usedLlm: boolean;
};

export class ImportUrlError extends Error {}

/**
 * Core single-URL extraction pipeline: fetch, extract, resolve, score.
 * Shared by the single-link importer and the source page scanner, which
 * runs this on each candidate URL an admin selects for a richer per-page
 * extraction than the directory page's brief card text can give.
 */
export async function extractListingFromUrl(rawUrl: string): Promise<ImportedListingDraft> {
  let html: string;
  let finalUrl: string;
  try {
    const page = await fetchPage(rawUrl.trim());
    html = page.html;
    finalUrl = page.finalUrl;
  } catch (err) {
    if (isFetchPageError(err)) throw new ImportUrlError(err.message);
    throw new ImportUrlError("Could not fetch that page.");
  }

  // Image extraction stays mechanical (JSON-LD/OG image, first sizable
  // <img>) regardless of path — a text-only LLM call has no better signal
  // for "which image is the hero image" than og:image already gives us.
  const mechanicalDraft = extractListingDraft(html, finalUrl);

  const llmResult = await extractWithLlm(html, finalUrl);

  let title: string | null;
  let description: string | null;
  let location: string | null;
  let listingType: ListingType;
  let startsAt: string | null;
  let endsAt: string | null;
  let tags: string[];
  let establishmentId: string | null;
  let establishmentName: string | null;
  let ctaLabel: string;
  const usedLlm = llmResult !== null;

  if (llmResult) {
    title = llmResult.title;
    description = llmResult.description;
    location = llmResult.location;
    listingType = llmResult.listing_type;
    startsAt = llmResult.starts_at;
    endsAt = llmResult.ends_at;
    tags = llmResult.tags;
    establishmentId = llmResult.establishment_id;
    establishmentName = llmResult.establishment_name;
    ctaLabel = llmResult.cta_label;
  } else {
    const searchText = [mechanicalDraft.title, mechanicalDraft.description, mechanicalDraft.location, finalUrl]
      .filter(Boolean)
      .join(" ");
    const establishment = guessEstablishment(mechanicalDraft.site_name, searchText);

    title = mechanicalDraft.title;
    description = mechanicalDraft.description;
    location = mechanicalDraft.location;
    listingType = guessListingType(searchText);
    startsAt = mechanicalDraft.starts_at;
    endsAt = mechanicalDraft.ends_at;
    tags = guessTags(searchText);
    establishmentId = establishment.id;
    establishmentName = establishment.name;
    ctaLabel = listingType === "deal" ? "Claim Deal" : "View Event";
  }

  const imageUrl = mechanicalDraft.image_url;

  const confidence = computeConfidence({
    title,
    description,
    location,
    starts_at: startsAt,
    ends_at: endsAt,
    image_url: imageUrl,
    tags,
    establishment_name: establishmentName,
  });

  return {
    finalUrl,
    title: title ?? "",
    description: description ?? "",
    location: location ?? "",
    listingType,
    startsAt: startsAt ?? "",
    endsAt: endsAt ?? "",
    tags,
    imageUrl: imageUrl ?? "",
    establishmentId,
    establishmentName: establishmentName ?? "",
    ctaLabel,
    confidence,
    usedLlm,
  };
}
