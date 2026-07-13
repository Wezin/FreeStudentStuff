import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Listing, ListingFilters } from "./types";

const PUBLIC_COLUMNS = "*";

function matchesSearch(listing: Listing, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    listing.title,
    listing.description,
    listing.establishment_name,
    listing.location ?? "",
    ...listing.tags,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

function matchesTime(listing: Listing, time: ListingFilters["time"]): boolean {
  if (!time || time === "all") return true;

  const now = new Date();

  if (time === "ongoing") {
    if (listing.listing_type !== "deal") return false;
    return !listing.ends_at || new Date(listing.ends_at) > now;
  }

  if (!listing.starts_at) return false;
  const startsAt = new Date(listing.starts_at);

  if (time === "today") {
    return startsAt.toDateString() === now.toDateString();
  }

  if (time === "this-week") {
    const weekStart = startOfWeek(now);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return startsAt >= weekStart && startsAt < weekEnd;
  }

  return true;
}

/** Fetches every published, non-expired listing matching the DB-level filters. */
async function fetchPublishedListings(filters: Pick<ListingFilters, "tag" | "listingType">) {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("listings")
    .select(PUBLIC_COLUMNS)
    .eq("status", "published")
    .or(`ends_at.is.null,ends_at.gt.${new Date().toISOString()}`);

  if (filters.tag && filters.tag !== "all") {
    query = query.overlaps("tags", [filters.tag]);
  }
  if (filters.listingType && filters.listingType !== "all") {
    query = query.eq("listing_type", filters.listingType);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Listing[];
}

/** Applies search + time filtering in-memory on top of the DB-filtered set. */
export async function getPublicListings(filters: ListingFilters): Promise<Listing[]> {
  const listings = await fetchPublishedListings(filters);
  return listings
    .filter((listing) => matchesSearch(listing, filters.q ?? ""))
    .filter((listing) => matchesTime(listing, filters.time));
}

export async function getHeroListings(limit = 6): Promise<Listing[]> {
  const listings = await fetchPublishedListings({});
  const featured = listings.filter((l) => l.is_featured);
  if (featured.length > 0) return featured.slice(0, limit);
  return listings.slice(0, limit);
}

export async function getListingsForTag(tag: string, limit = 12): Promise<Listing[]> {
  const listings = await fetchPublishedListings({ tag });
  return listings.slice(0, limit);
}

// ---------------------------------------------------------------------------
// Admin queries — service role client, no status/expiry filtering.
// ---------------------------------------------------------------------------

export async function getAdminListings(): Promise<Listing[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("listings")
    .select(PUBLIC_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Listing[];
}

export async function getAdminListingById(id: string): Promise<Listing | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("listings")
    .select(PUBLIC_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Listing | null;
}

export async function slugExists(slug: string, excludeId?: string): Promise<boolean> {
  const supabase = createAdminClient();
  let query = supabase.from("listings").select("id").eq("slug", slug);
  if (excludeId) {
    query = query.neq("id", excludeId);
  }
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return !!data;
}

/** Every listing's source URL — powers the page scanner's duplicate
 *  detection. Fetches the full (small) set rather than filtering by exact
 *  URL match, since the caller needs to compare normalized URLs (a
 *  candidate's raw link vs. the possibly-redirected URL that got saved) —
 *  see normalizeUrlForDedup in scan-actions.ts. */
export async function getAllListingSourceUrls(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("listings").select("source_url");
  if (error) throw error;

  return (data ?? []).map((row) => row.source_url as string);
}

/** Distinct tags across all listings, most-used first — powers the tag picker/pills. */
export async function getAllTags(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("listings").select("tags");
  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    for (const tag of (row.tags as string[]) ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([tag]) => tag);
}

export type AdminListingStats = {
  published: number;
  draft: number;
  expired: number;
  archived: number;
};

export async function getAdminListingStats(): Promise<AdminListingStats> {
  const listings = await getAdminListings();
  return {
    published: listings.filter((l) => l.status === "published").length,
    draft: listings.filter((l) => l.status === "draft").length,
    expired: listings.filter((l) => l.status === "expired").length,
    archived: listings.filter((l) => l.status === "archived").length,
  };
}
