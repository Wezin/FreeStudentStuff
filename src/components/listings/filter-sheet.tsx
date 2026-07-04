"use client";

import { Funnel } from "@phosphor-icons/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export function FilterSheet({
  listingType,
  time,
  onListingTypeChange,
  onTimeChange,
}: FilterSheetProps) {
  const activeCount = (listingType !== "all" ? 1 : 0) + (time !== "all" ? 1 : 0);

  return (
    <Sheet>
      <TooltipButton label="Filters">
        <span className="contents">
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Filters"
              className={cn(
                "relative flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background/70 text-foreground backdrop-blur-xl transition hover:bg-muted",
              )}
            >
              <Funnel className="size-4" />
              {activeCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {activeCount}
                </span>
              )}
            </button>
          </SheetTrigger>
        </span>
      </TooltipButton>
      <SheetContent side="right" className="border-border">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Narrow results by type or time.</SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={listingType} onValueChange={onListingTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {LISTING_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Time</Label>
            <Select value={time} onValueChange={onTimeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                {TIME_FILTERS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
      </SheetContent>
    </Sheet>
  );
}
