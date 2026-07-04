"use client";

import { CaretUp, CaretDown, CaretUpDown } from "@phosphor-icons/react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc";

type SortableTableHeadProps<K extends string> = {
  label: string;
  sortKey: K;
  activeKey: K | null;
  direction: SortDirection;
  onSort: (key: K) => void;
  className?: string;
};

export function SortableTableHead<K extends string>({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  className,
}: SortableTableHeadProps<K>) {
  const isActive = activeKey === sortKey;

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        aria-label={`Sort by ${label}`}
        className={cn(
          "inline-flex items-center gap-1 transition hover:text-foreground",
          isActive && "text-foreground",
        )}
      >
        {label}
        {isActive ? (
          direction === "asc" ? (
            <CaretUp className="size-3" weight="bold" />
          ) : (
            <CaretDown className="size-3" weight="bold" />
          )
        ) : (
          <CaretUpDown className="size-3 opacity-40" />
        )}
      </button>
    </TableHead>
  );
}
