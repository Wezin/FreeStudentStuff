"use client";

import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TagPills } from "./tag-pills";
import { FilterSheet } from "./filter-sheet";
import { ListingRow } from "./listing-row";
import { ListingGrid } from "./listing-grid";
import { searchListings } from "@/features/listings/search-action";
import type { Listing, ListingType, TimeFilter } from "@/features/listings/types";

type TagRow = {
  tag: string;
  listings: Listing[];
};

type BrowseFiltersProps = {
  tags: string[];
  tagRows: TagRow[];
  query?: string;
};

const ALL_TAG = "All";

export function BrowseFilters({ tags, tagRows, query = "" }: BrowseFiltersProps) {
  const [tag, setTag] = useState(ALL_TAG);
  const [listingType, setListingType] = useState("all");
  const [time, setTime] = useState<TimeFilter | "all">("all");
  const [results, setResults] = useState<Listing[]>([]);
  const [isPending, startTransition] = useTransition();

  const isFiltered = tag !== ALL_TAG || listingType !== "all" || time !== "all" || query !== "";

  useEffect(() => {
    if (!isFiltered) return;
    startTransition(async () => {
      const data = await searchListings({
        q: query,
        tag: tag === ALL_TAG ? "all" : tag,
        listingType: listingType as ListingType | "all",
        time: time as TimeFilter,
      });
      setResults(data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag, listingType, time, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 px-4 sm:px-6">
        <TagPills tags={tags} active={tag} onSelect={setTag} />
        <FilterSheet
          listingType={listingType}
          time={time}
          onListingTypeChange={setListingType}
          onTimeChange={(v) => setTime(v as TimeFilter)}
        />
      </div>

      <AnimatePresence mode="wait">
        {isFiltered ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {isPending && results.length === 0 ? (
              <div className="px-4 py-16 text-center text-sm text-muted-foreground sm:px-6">
                Loading...
              </div>
            ) : (
              <ListingGrid listings={results} />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="rows"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="space-y-10"
          >
            {tagRows.map(({ tag: t, listings }) => (
              <ListingRow key={t} title={t} listings={listings} onSeeAll={() => setTag(t)} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
