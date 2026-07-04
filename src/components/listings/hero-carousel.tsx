"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowSquareOut, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { GlassSurface } from "@/components/glass/glass-surface";
import { TooltipButton } from "@/components/ui/tooltip-button";
import { ListingDetailModal } from "./listing-detail-modal";
import { EstablishmentIcon } from "./establishment-icon";
import { getTimeBadge } from "@/features/listings/utils";
import type { Listing } from "@/features/listings/types";
import { cn } from "@/lib/utils";

type HeroCarouselProps = {
  listings: Listing[];
};

const AUTO_ROTATE_MS = 6000;

export function HeroCarousel({ listings }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (listings.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % listings.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(timer);
  }, [listings.length]);

  if (listings.length === 0) return null;

  const listing = listings[index];
  const mediaLayoutId = `hero-media-${listing.id}`;
  const timeBadge = getTimeBadge(listing);

  function goTo(next: number) {
    setIndex((next + listings.length) % listings.length);
  }

  return (
    <section className="px-4 sm:px-6">
      <div className="group relative aspect-[8/5] w-full overflow-hidden rounded-3xl bg-muted sm:aspect-[32/9]">
        <AnimatePresence mode="wait">
          <motion.div
            key={listing.id}
            role="button"
            tabIndex={0}
            onClick={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpen(true);
              }
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 block size-full cursor-pointer text-left"
          >
            <motion.div layoutId={mediaLayoutId} className="absolute inset-0">
              <Image
                src={listing.thumbnail_url}
                alt={listing.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1152px"
                className="object-cover"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />

            <div className="absolute inset-x-0 bottom-0 flex flex-col">
              {listings.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 pb-3">
                  {listings.map((l, i) => (
                    <button
                      key={l.id}
                      type="button"
                      aria-label={`Go to slide ${i + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        goTo(i);
                      }}
                      className={cn(
                        "relative h-1.5 overflow-hidden rounded-full bg-white/30 transition-[width]",
                        i === index ? "w-8" : "w-1.5",
                      )}
                    >
                      {i === index && (
                        <motion.span
                          key={`${listing.id}-progress`}
                          className="absolute inset-y-0 left-0 rounded-full bg-white"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: AUTO_ROTATE_MS / 1000, ease: "linear" }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <GlassSurface
                tone="dark"
                cornerRadius={0}
                padding="1.25rem 1.25rem"
                className="flex w-full flex-col gap-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                    {timeBadge}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white">
                    {listing.establishment_id && (
                      <EstablishmentIcon id={listing.establishment_id} className="size-3.5 rounded-sm" />
                    )}
                    {listing.establishment_name}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-balance text-white sm:text-2xl">
                  {listing.title}
                </h2>
                <a
                  href={listing.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  {listing.cta_label || "Open Link"}
                  <ArrowSquareOut className="size-4" aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </GlassSurface>
            </div>
          </motion.div>
        </AnimatePresence>

        {listings.length > 1 && (
          <>
            <TooltipButton label="Previous listing">
              <button
                type="button"
                aria-label="Previous listing"
                onClick={() => goTo(index - 1)}
                className="absolute left-2 top-1/2 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full text-white opacity-0 backdrop-blur-md transition hover:bg-black/50 group-hover:bg-black/30 group-hover:opacity-100 sm:flex"
              >
                <CaretLeft className="size-4" />
              </button>
            </TooltipButton>
            <TooltipButton label="Next listing">
              <button
                type="button"
                aria-label="Next listing"
                onClick={() => goTo(index + 1)}
                className="absolute right-2 top-1/2 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full text-white opacity-0 backdrop-blur-md transition hover:bg-black/50 group-hover:bg-black/30 group-hover:opacity-100 sm:flex"
              >
                <CaretRight className="size-4" />
              </button>
            </TooltipButton>
          </>
        )}
      </div>

      <ListingDetailModal
        listing={listing}
        open={open}
        onOpenChange={setOpen}
        mediaLayoutId={mediaLayoutId}
      />
    </section>
  );
}
