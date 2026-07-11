export type ListingType = "event" | "deal";

export type ListingStatus = "draft" | "published" | "expired" | "archived";

export type Listing = {
  id: string;
  title: string;
  slug: string;
  description: string;
  listing_type: ListingType;
  location: string | null;
  /** Event: start of the time frame. Unused for deals. */
  starts_at: string | null;
  /** Event: end of the time frame. Deal: deadline (null = no deadline / ongoing). */
  ends_at: string | null;
  tags: string[];
  thumbnail_url: string;
  source_url: string;
  cta_label: string;
  establishment_id: string | null;
  establishment_name: string;
  status: ListingStatus;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type TimeFilter = "all" | "today" | "this-week" | "ongoing";

export type ListingFilters = {
  q?: string;
  tag?: string | "all";
  listingType?: ListingType | "all";
  time?: TimeFilter;
};

// Shared with the link importer's confidence indicator. Lives here (not in
// lib/import/, which is server-only) so the admin form — a client
// component — can safely import the type.
export type ImportFieldKey =
  | "title"
  | "description"
  | "location"
  | "starts_at"
  | "ends_at"
  | "image_url"
  | "tags"
  | "establishment_name";

export type ImportConfidence = {
  checks: Record<ImportFieldKey, boolean>;
  found: number;
  total: number;
  score: number;
};
