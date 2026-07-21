"use client";

import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TagPills } from "./tag-pills";
import { FilterSheet } from "./filter-sheet";
import { ListingRow } from "./listing-row";
import { ListingGrid } from "./listing-grid";
import { ListingSection } from "./listing-section";
import { SchoolFilterSelect } from "./school-filter-select";
import { searchListings } from "@/features/listings/search-action";
import { SCHOOL_FILTER_TAGS } from "@/features/listings/constants";
import type { Listing, ListingType, TimeFilter } from "@/features/listings/types";

type BrowseFiltersProps = {
  tags: string[];
  events: Listing[];
  deals: Listing[];
  query?: string;
};

const ALL_TAG = "All";

function isSchoolTag(tag: string): boolean {
  return (SCHOOL_FILTER_TAGS as readonly string[]).includes(tag);
}

export function BrowseFilters({ tags, events, deals, query = "" }: BrowseFiltersProps) {
  const [tag, setTag] = useState(ALL_TAG);
  const [listingType, setListingType] = useState("all");
  const [time, setTime] = useState<TimeFilter | "all">("all");
  const [results, setResults] = useState<Listing[]>([]);
  const [isPending, startTransition] = useTransition();

  const isFiltered = tag !== ALL_TAG || listingType !== "all" || time !== "all" || query !== "";
  const pillActive = isSchoolTag(tag) ? "" : tag;
  const schoolValue = isSchoolTag(tag) ? tag : "all";

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

  function handlePillSelect(value: string) {
    setTag(value);
  }

  function handleSchoolSelect(value: string) {
    setTag(value === "all" ? ALL_TAG : value);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 px-4 sm:px-6">
        <TagPills tags={tags} active={pillActive} onSelect={handlePillSelect} />
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <SchoolFilterSelect value={schoolValue} onChange={handleSchoolSelect} />
          <FilterSheet
            listingType={listingType}
            time={time}
            onListingTypeChange={setListingType}
            onTimeChange={(v) => setTime(v as TimeFilter)}
          />
        </div>
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
            key="sections"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="space-y-10"
          >
            {events.length > 0 ? (
              <ListingRow
                title="Upcoming Events"
                listings={events}
                onSeeAll={() => setTag("Events")}
              />
            ) : null}
            {deals.length > 0 ? (
              <ListingSection title="Student Deals" onSeeAll={() => setTag("Deals")}>
                <ListingGrid listings={deals} />
              </ListingSection>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
