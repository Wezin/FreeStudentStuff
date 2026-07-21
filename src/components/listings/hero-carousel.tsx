"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { TooltipButton } from "@/components/ui/tooltip-button";
import { ListingDetailModal } from "./listing-detail-modal";
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

            {listings.length > 1 && (
              <div className="absolute inset-x-0 top-4 z-10 flex items-center justify-center gap-1.5">
                {listings.map((l, i) => (
                  <button
                    key={l.id}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={i === index ? "true" : undefined}
                    onClick={(e) => {
                      e.stopPropagation();
                      goTo(i);
                    }}
                    className={cn(
                      "relative h-2 overflow-hidden rounded-full bg-white/30 transition-[width]",
                      i === index ? "w-10" : "w-2",
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

            <div className="absolute inset-x-0 bottom-0">
              <div
                aria-hidden
                className="absolute inset-0 backdrop-blur-md [mask-image:linear-gradient(to_top,black_50%,transparent)]"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
              />
              <h2 className="relative truncate px-4 pb-4 pt-14 text-xl font-semibold text-white sm:px-5 sm:pb-5 sm:text-2xl">
                {listing.title}
              </h2>
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
