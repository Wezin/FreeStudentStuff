"use client";

import { Buildings } from "@phosphor-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
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
        <EstablishmentIcon id={establishmentId} className="size-4 shrink-0" />
        <span>{tag}</span>
      </>
    );
  }

  return (
    <>
      <Buildings className="size-4 shrink-0" weight="duotone" />
      <span>All schools</span>
    </>
  );
}

export function SchoolFilterSelect({ value, onChange, className }: SchoolFilterSelectProps) {
  const isActive = value !== "all";
  const label = isActive ? value : "all";

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "h-auto w-auto shrink-0 gap-1.5 rounded-full border-border px-3 py-1.5 text-sm font-medium shadow-lg backdrop-blur-xl backdrop-saturate-150 transition-colors",
          isActive
            ? "border-primary/40 bg-primary text-primary-foreground [&_svg]:text-primary-foreground/70"
            : "bg-background/70 text-muted-foreground hover:text-foreground",
          className,
        )}
      >
        <span className="flex items-center gap-1.5">
          <SchoolOptionContent tag={label} />
        </span>
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="all">
          <span className="flex items-center gap-2">
            <Buildings className="size-4 shrink-0" weight="duotone" />
            All schools
          </span>
        </SelectItem>
        {SCHOOL_FILTER_TAGS.map((school) => {
          const establishmentId = getSchoolEstablishmentId(school);
          return (
            <SelectItem key={school} value={school}>
              <span className="flex items-center gap-2">
                {establishmentId ? (
                  <EstablishmentIcon id={establishmentId} className="size-4 shrink-0" />
                ) : null}
                {school}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
