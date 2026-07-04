"use server";

import { getPublicListings } from "./queries";
import type { ListingFilters, Listing } from "./types";

/** Public, unauthenticated search used by the inline homepage filter UI. */
export async function searchListings(filters: ListingFilters): Promise<Listing[]> {
  return getPublicListings(filters);
}
