import type { ListingStatus, ListingType, TimeFilter } from "./types";

export const LISTING_TYPES: { value: ListingType; label: string }[] = [
  { value: "event", label: "Event" },
  { value: "deal", label: "Deal" },
];

export const STATUSES: { value: ListingStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "expired", label: "Expired" },
  { value: "archived", label: "Archived" },
];

export const TIME_FILTERS: { value: TimeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "today", label: "Today" },
  { value: "this-week", label: "This Week" },
  { value: "ongoing", label: "Ongoing" },
];

export const CTA_LABEL_SUGGESTIONS = [
  "Open Link",
  "Register",
  "Claim Deal",
  "Apply",
  "Learn More",
  "View Event",
];

export const DEFAULT_CTA_LABEL = "Open Link";

// Starter list for the tag picker/pills — combines the old category and
// school concepts into one flat, admin-extensible tag vocabulary. Admins
// can create new tags freely from the admin form; this is just a seed list.
export const INITIAL_TAGS = [
  "Free Food",
  "Events",
  "Deals",
  "Opportunities",
  "Scholarships",
  "Hackathons",
  "Clubs",
  "Carleton",
  "uOttawa",
  "Algonquin",
  "Ottawa-wide",
  "Online",
];

/** Virtual browse filter — matched in queries, not a listing tag. */
export const ON_CAMPUS_FILTER = "On Campus";

/** School/region tags used to detect on-campus listings. */
export const SCHOOL_TAGS = ["Carleton", "uOttawa", "Algonquin", "Ottawa-wide"] as const;

// Homepage pill row (in addition to "All", which TagPills prepends). Kept
// short and stable — not derived from the full tag vocabulary in listings.
export const BROWSE_FILTER_TAGS = ["Deals", "Events", ON_CAMPUS_FILTER];

// School filter dropdown on the homepage — filter-only, not homepage rows.
export const SCHOOL_FILTER_TAGS = ["uOttawa", "Carleton", "Algonquin"];

export function listingTypeLabel(value: ListingType): string {
  return LISTING_TYPES.find((t) => t.value === value)?.label ?? value;
}
