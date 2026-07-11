"use client";

import { useRef } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { TooltipButton } from "@/components/ui/tooltip-button";
import { ListingCard } from "./listing-card";
import type { Listing } from "@/features/listings/types";

type ListingRowProps = {
  title: string;
  listings: Listing[];
  onSeeAll: () => void;
};

export function ListingRow({ title, listings, onSeeAll }: ListingRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (listings.length === 0) return null;

  function scrollBy(direction: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-4 sm:px-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {title}
        </h2>
        <button
          type="button"
          onClick={onSeeAll}
          className="flex items-center gap-0.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          See All
          <CaretRight className="size-3.5" aria-hidden />
        </button>
      </div>

      <div className="group/row relative">
        <div
          ref={scrollRef}
          className="scrollbar-none flex gap-3 overflow-x-auto px-4 pb-1 sm:px-6"
        >
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} sectionId={title} />
          ))}
        </div>

        <TooltipButton label={`Scroll ${title} left`}>
          <button
            type="button"
            aria-label={`Scroll ${title} left`}
            onClick={() => scrollBy(-1)}
            className="absolute left-1 top-1/2 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full text-white opacity-0 backdrop-blur-md transition hover:bg-black/50 group-hover/row:bg-black/30 group-hover/row:opacity-100 sm:flex"
          >
            <CaretLeft className="size-4" />
          </button>
        </TooltipButton>
        <TooltipButton label={`Scroll ${title} right`}>
          <button
            type="button"
            aria-label={`Scroll ${title} right`}
            onClick={() => scrollBy(1)}
            className="absolute right-1 top-1/2 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full text-white opacity-0 backdrop-blur-md transition hover:bg-black/50 group-hover/row:bg-black/30 group-hover/row:opacity-100 sm:flex"
          >
            <CaretRight className="size-4" />
          </button>
        </TooltipButton>
      </div>
    </section>
  );
}
