"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowSquareOut, CalendarBlank, MapPin, Buildings } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { EstablishmentIcon } from "./establishment-icon";
import { listingTypeLabel } from "@/features/listings/constants";
import { formatListingDate } from "@/features/listings/utils";
import type { Listing } from "@/features/listings/types";

const containerVariants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.1, staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" as const } },
};

type ListingDetailModalProps = {
  listing: Listing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Must match the layoutId on the element that triggered this modal, so
   *  Framer Motion can morph the image from its origin card/hero slide. */
  mediaLayoutId?: string;
};

export function ListingDetailModal({
  listing,
  open,
  onOpenChange,
  mediaLayoutId,
}: ListingDetailModalProps) {
  if (!listing) return null;

  const startsLabel = formatListingDate(listing.starts_at);
  const endsLabel = formatListingDate(listing.ends_at);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] !animate-none gap-0 overflow-y-auto border-border bg-popover p-0 sm:max-w-lg">
        <motion.div
          layoutId={mediaLayoutId}
          className="relative aspect-video w-full overflow-hidden rounded-t-xl bg-muted"
        >
          <Image
            src={listing.thumbnail_url}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, 32rem"
            className="object-cover"
          />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4 p-6"
        >
          <DialogHeader className="space-y-2 text-left">
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{listingTypeLabel(listing.listing_type)}</Badge>
            </motion.div>
            <motion.div variants={itemVariants}>
              <DialogTitle className="text-xl font-semibold text-balance">
                {listing.title}
              </DialogTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <DialogDescription className="whitespace-pre-line text-sm text-muted-foreground">
                {listing.description}
              </DialogDescription>
            </motion.div>
          </DialogHeader>

          <motion.div variants={itemVariants} className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {listing.establishment_id ? (
                <EstablishmentIcon id={listing.establishment_id} className="size-4 shrink-0 rounded-sm" />
              ) : (
                <Buildings className="size-4 shrink-0" />
              )}
              <span>{listing.establishment_name}</span>
            </div>
            {listing.location && (
              <div className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" />
                <span>{listing.location}</span>
              </div>
            )}
            {listing.listing_type === "event" && (startsLabel || endsLabel) && (
              <div className="flex items-center gap-2">
                <CalendarBlank className="size-4 shrink-0" />
                <span>
                  {startsLabel}
                  {endsLabel ? ` – ${endsLabel}` : ""}
                </span>
              </div>
            )}
            {listing.listing_type === "deal" && endsLabel && (
              <div className="flex items-center gap-2">
                <CalendarBlank className="size-4 shrink-0" />
                <span>Deadline: {endsLabel}</span>
              </div>
            )}
          </motion.div>

          {listing.tags.length > 0 && (
            <motion.div variants={itemVariants} className="flex flex-wrap gap-1.5">
              {listing.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-foreground/5 px-2.5 py-1 text-xs text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </motion.div>
          )}

          <motion.a
            variants={itemVariants}
            href={listing.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            {listing.cta_label || "Open Link"}
            <ArrowSquareOut className="size-4" aria-hidden />
            <span className="sr-only">(opens in a new tab)</span>
          </motion.a>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
