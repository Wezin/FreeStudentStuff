"use client";

import { useState } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { HeroCarousel } from "@/components/listings/hero-carousel";
import { BrowseFilters } from "@/components/listings/browse-filters";
import type { Listing } from "@/features/listings/types";

type TagRow = { tag: string; listings: Listing[] };

type HomeShellProps = {
  hero: Listing[];
  tags: string[];
  tagRows: TagRow[];
};

/** Owns the search query so the header search box and the inline tag/type/time
 *  filters in BrowseFilters share one client-side filtering flow — no page nav. */
export function HomeShell({ hero, tags, tagRows }: HomeShellProps) {
  const [query, setQuery] = useState("");

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader onSearch={setQuery} />
      <main className="flex-1 space-y-6 py-6 sm:py-8">
        <HeroCarousel listings={hero} />
        <BrowseFilters tags={tags} tagRows={tagRows} query={query} />
      </main>
      <SiteFooter />
    </div>
  );
}
