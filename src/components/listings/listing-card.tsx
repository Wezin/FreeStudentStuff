"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react";
import { getTimeBadge } from "@/features/listings/utils";
import { ListingDetailModal } from "./listing-detail-modal";
import { EstablishmentIcon } from "./establishment-icon";
import type { Listing } from "@/features/listings/types";
import { cn } from "@/lib/utils";

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

  const titleRef = useRef<HTMLHeadingElement>(null);
  const [overflowPx, setOverflowPx] = useState(0);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    setOverflowPx(Math.max(0, el.scrollWidth - el.clientWidth));
  }, [listing.title]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group relative aspect-video shrink-0 overflow-hidden rounded-3xl bg-muted text-left ring-1 ring-border transition hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          fluid ? "w-full" : size === "large" ? "w-[300px] sm:w-[360px]" : "w-[240px] sm:w-[280px]",
          className,
        )}
      >
        <motion.div layoutId={mediaLayoutId} className="absolute inset-0">
          <Image
            src={listing.thumbnail_url}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 70vw, 360px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        </motion.div>
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        <span className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
          <ArrowUpRight className="size-4" aria-hidden />
        </span>
        <span className="absolute left-2 top-2 rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-semibold text-primary-foreground">
          {timeBadge}
        </span>

        <div className="absolute inset-x-0 bottom-0 space-y-1 overflow-hidden p-3">
          {listing.establishment_id && (
            <div className="flex items-center gap-1.5">
              <EstablishmentIcon id={listing.establishment_id} className="size-4 shrink-0 rounded-sm" />
              <span className="truncate text-xs font-medium text-white/80">
                {listing.establishment_name}
              </span>
            </div>
          )}
          <motion.h3
            ref={titleRef}
            initial={false}
            whileHover={overflowPx > 0 ? { x: -overflowPx } : undefined}
            transition={{ duration: Math.max(0.6, overflowPx / 40), ease: "linear" }}
            className="whitespace-nowrap text-sm font-semibold text-white sm:text-base"
          >
            {listing.title}
          </motion.h3>
        </div>
      </button>

      <ListingDetailModal
        listing={listing}
        open={open}
        onOpenChange={setOpen}
        mediaLayoutId={mediaLayoutId}
      />
    </>
  );
}
