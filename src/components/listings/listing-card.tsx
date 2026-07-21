"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react";
import { getTimeBadge } from "@/features/listings/utils";
import { ListingDetailModal } from "./listing-detail-modal";
import { EstablishmentIcon } from "./establishment-icon";
import type { Listing } from "@/features/listings/types";
import { cn } from "@/lib/utils";
import { useState } from "react";

type ListingCardProps = {
  listing: Listing;
  size?: "default" | "large";
  /** Fill the width of the parent grid cell instead of using a fixed card width. */
  fluid?: boolean;
  className?: string;
  /** Distinguishes this card's shared layout animation from other cards for
   *  the same listing rendered elsewhere on the page (e.g. the same listing
   *  can appear in more than one tag row) — Framer Motion only shows one of
   *  several simultaneously-mounted elements sharing a layoutId, so each
   *  row/section must give its cards a distinct one. */
  sectionId?: string;
};

export function ListingCard({ listing, size = "default", fluid = false, className, sectionId = "default" }: ListingCardProps) {
  const [open, setOpen] = useState(false);
  const timeBadge = getTimeBadge(listing);
  const mediaLayoutId = `card-media-${sectionId}-${listing.id}`;

  return (
    <>
      <motion.button
        type="button"
        layout
        onClick={() => setOpen(true)}
        className={cn(
          "group flex shrink-0 flex-col overflow-hidden rounded-xl bg-card p-2 text-left ring-1 ring-border transition hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          fluid ? "w-full" : size === "large" ? "w-[300px] sm:w-[360px]" : "w-[240px] sm:w-[280px]",
          className,
        )}
      >
        <motion.div
          layoutId={mediaLayoutId}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted"
        >
          <Image
            src={listing.thumbnail_url}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 70vw, 360px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
          <span className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
            <ArrowUpRight className="size-4" aria-hidden />
          </span>
          <span className="absolute left-1.5 top-1.5 rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-semibold text-primary-foreground">
            {timeBadge}
          </span>
        </motion.div>

        <div className="flex min-w-0 flex-col gap-1 overflow-hidden px-0.5 pt-2">
          {listing.establishment_id && (
            <div className="flex min-w-0 items-center gap-1.5">
              <EstablishmentIcon id={listing.establishment_id} className="size-4 shrink-0 rounded-sm" />
              <span className="truncate text-xs font-medium text-muted-foreground">
                {listing.establishment_name}
              </span>
            </div>
          )}
          <h3
            title={listing.title}
            className="truncate text-sm font-semibold text-foreground sm:text-base"
          >
            {listing.title}
          </h3>
        </div>
      </motion.button>

      <ListingDetailModal
        listing={listing}
        open={open}
        onOpenChange={setOpen}
        mediaLayoutId={mediaLayoutId}
      />
    </>
  );
}
