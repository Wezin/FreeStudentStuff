"use client";

import { Buildings } from "@phosphor-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { GlassSurface } from "@/components/glass/glass-surface";
import { EstablishmentIcon } from "@/components/listings/establishment-icon";
import { SCHOOL_FILTER_TAGS } from "@/features/listings/constants";
import { getSchoolEstablishmentId } from "@/features/listings/establishments";
import { cn } from "@/lib/utils";

type SchoolFilterSelectProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

function SchoolOptionContent({ tag }: { tag: string }) {
  const establishmentId = getSchoolEstablishmentId(tag);

  if (establishmentId) {
    return (
      <>
        <EstablishmentIcon id={establishmentId} className="size-3.5 shrink-0" />
        <span>{tag}</span>
      </>
    );
  }

  return (
    <>
      <Buildings className="size-3.5 shrink-0" weight="duotone" />
      <span>All schools</span>
    </>
  );
}

export function SchoolFilterSelect({ value, onChange, className }: SchoolFilterSelectProps) {
  const isActive = value !== "all";
  const label = isActive ? value : "all";
  const ariaLabel = isActive ? `School: ${value}` : "All schools";

  return (
    <GlassSurface cornerRadius={999} padding="0.25rem" className={cn("shrink-0", className)}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          size="sm"
          aria-label={ariaLabel}
          className={cn(
            "h-7 w-auto shrink-0 gap-1 rounded-full border-0 bg-transparent px-3 py-0 text-sm font-medium shadow-none transition-colors dark:bg-transparent dark:hover:bg-transparent",
            isActive
              ? "bg-primary text-primary-foreground [&_svg]:text-primary-foreground/70"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span className="flex items-center gap-1.5">
            <SchoolOptionContent tag={label} />
          </span>
        </SelectTrigger>
        <SelectContent position="popper" align="end" side="bottom" sideOffset={6}>
          <SelectItem value="all">
            <span className="flex items-center gap-2">
              <Buildings className="size-3.5 shrink-0" weight="duotone" />
              All schools
            </span>
          </SelectItem>
          {SCHOOL_FILTER_TAGS.map((school) => {
            const establishmentId = getSchoolEstablishmentId(school);
            return (
              <SelectItem key={school} value={school}>
                <span className="flex items-center gap-2">
                  {establishmentId ? (
                    <EstablishmentIcon id={establishmentId} className="size-3.5 shrink-0" />
                  ) : null}
                  {school}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </GlassSurface>
  );
}
