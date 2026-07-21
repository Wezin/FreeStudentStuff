"use client";

import type { ReactNode } from "react";
import { Funnel } from "@phosphor-icons/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { TooltipButton } from "@/components/ui/tooltip-button";
import { LISTING_TYPES, TIME_FILTERS } from "@/features/listings/constants";
import { cn } from "@/lib/utils";

type FilterSheetProps = {
  listingType: string;
  time: string;
  onListingTypeChange: (value: string) => void;
  onTimeChange: (value: string) => void;
};

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm font-medium transition whitespace-nowrap",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function FilterSheet({
  listingType,
  time,
  onListingTypeChange,
  onTimeChange,
}: FilterSheetProps) {
  const activeCount = (listingType !== "all" ? 1 : 0) + (time !== "all" ? 1 : 0);

  return (
    <Popover>
      <TooltipButton label="Filters">
        <span className="contents">
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Filters"
              className={cn(
                "relative flex size-11.5 shrink-0 items-center justify-center rounded-full border border-border bg-background/70 text-foreground backdrop-blur-xl transition hover:bg-muted",
              )}
            >
              <Funnel className="size-4" />
              {activeCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {activeCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
        </span>
      </TooltipButton>
      <PopoverContent align="end" className="w-64">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex flex-wrap gap-1">
              <FilterPill
                active={listingType === "all"}
                onClick={() => onListingTypeChange("all")}
              >
                All Types
              </FilterPill>
              {LISTING_TYPES.map((type) => (
                <FilterPill
                  key={type.value}
                  active={listingType === type.value}
                  onClick={() => onListingTypeChange(type.value)}
                >
                  {type.label}
                </FilterPill>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Time</Label>
            <div className="flex flex-wrap gap-1">
              {TIME_FILTERS.map((filter) => (
                <FilterPill
                  key={filter.value}
                  active={time === filter.value}
                  onClick={() => onTimeChange(filter.value)}
                >
                  {filter.label}
                </FilterPill>
              ))}
            </div>
          </div>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => {
                onListingTypeChange("all");
                onTimeChange("all");
              }}
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
