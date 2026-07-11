import "server-only";
import { ALL_ESTABLISHMENTS } from "@/features/listings/establishments";
import type { ImportConfidence, ImportFieldKey, ListingType } from "@/features/listings/types";

const TAG_KEYWORDS: Record<string, string[]> = {
  "Free Food": ["pizza", "food", "restaurant", "cafe", "café", "meal", "snack", "free food", "lunch", "dinner", "breakfast"],
  Opportunities: ["job", "career", "internship", "networking", "employer", "resume", "hiring"],
  Hackathons: ["hackathon", "coding", "developer", "programming", "tech competition", "hack the"],
  Scholarships: ["scholarship", "bursary", "funding", "grant", "award"],
  Deals: ["merch", "clothing", "apparel", "hoodie", "laptop", "software", "student discount", "subscription", "deal", "discount", "% off"],
  Clubs: ["club night", "club meeting", "club recruitment", "club fair"],
  Events: ["party", "social", "mixer", "game night", "meetup"],
  Carleton: ["carleton"],
  uOttawa: ["uottawa", "university of ottawa", "université d'ottawa", "universite d'ottawa"],
  Algonquin: ["algonquin"],
  Online: ["online event", "virtual event", "webinar", "zoom link", "livestream"],
};

const DEAL_KEYWORDS = ["deal", "discount", "% off", "coupon", "promo code", "promo", "sale", "student discount"];

/** Simple keyword matching against the existing tag vocabulary — not NLP,
 *  just enough to prefill sensible defaults for the admin to correct. */
export function guessTags(text: string): string[] {
  const lower = text.toLowerCase();
  const tags: string[] = [];

  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) tags.push(tag);
  }

  const hasSchoolTag = tags.includes("Carleton") || tags.includes("uOttawa") || tags.includes("Algonquin");
  if (!hasSchoolTag && lower.includes("ottawa")) tags.push("Ottawa-wide");

  return tags;
}

export function guessListingType(text: string): ListingType {
  const lower = text.toLowerCase();
  return DEAL_KEYWORDS.some((kw) => lower.includes(kw)) ? "deal" : "event";
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Whole-word match only — a plain substring check would let a short id
 *  like "x" match inside unrelated words (e.g. "next.js"). */
function containsWord(haystack: string, needle: string): boolean {
  if (!needle) return false;
  return new RegExp(`\\b${escapeRegExp(needle.toLowerCase())}\\b`, "i").test(haystack);
}

/** Matches the extracted site/organizer name against our curated
 *  establishment list; falls back to the raw name as free text. */
export function guessEstablishment(
  siteName: string | null,
  text: string,
): { id: string | null; name: string | null } {
  const haystack = `${siteName ?? ""} ${text}`;

  for (const est of ALL_ESTABLISHMENTS) {
    if (containsWord(haystack, est.name) || containsWord(haystack, est.id)) {
      return { id: est.id, name: est.name };
    }
  }

  return { id: null, name: siteName };
}

export type ConfidenceInputFields = {
  title: string | null;
  description: string | null;
  location: string | null;
  starts_at: string | null;
  ends_at: string | null;
  image_url: string | null;
  tags: string[];
  establishment_name: string | null;
};

/** Field-presence confidence, computed uniformly regardless of whether the
 *  values came from the LLM extraction or the mechanical regex fallback. */
export function computeConfidence(fields: ConfidenceInputFields): ImportConfidence {
  const checks: Record<ImportFieldKey, boolean> = {
    title: !!fields.title,
    description: !!fields.description,
    location: !!fields.location,
    starts_at: !!fields.starts_at,
    ends_at: !!fields.ends_at,
    image_url: !!fields.image_url,
    tags: fields.tags.length > 0,
    establishment_name: !!fields.establishment_name,
  };

  const found = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;

  return { checks, found, total, score: Math.round((found / total) * 100) };
}
