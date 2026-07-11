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

// Fixed, curated set for the homepage's top filter pill row (in addition to
// "All", which TagPills prepends automatically). Deliberately NOT derived
// from the full set of tags in use across listings — that list grows every
// time a listing (or the AI importer, which tags fairly liberally) introduces
// a new specific tag like "Immigration" or "Networking", and the pill row
// should stay short and stable regardless. Edit this list directly to change
// what shows up.
export const BROWSE_FILTER_TAGS = ["Events", "Deals", "Free Food", "Opportunities", "Scholarships"];

export function listingTypeLabel(value: ListingType): string {
  return LISTING_TYPES.find((t) => t.value === value)?.label ?? value;
}
