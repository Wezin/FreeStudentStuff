"use client";

import { GlassSurface } from "@/components/glass/glass-surface";
import { cn } from "@/lib/utils";

type TagPillsProps = {
  tags: string[];
  active: string;
  onSelect: (value: string) => void;
};

export function TagPills({ tags, active, onSelect }: TagPillsProps) {
  const items = ["All", ...tags];

  return (
    <GlassSurface
      cornerRadius={999}
      padding="0.375rem"
      className="flex flex-1 min-w-0 items-center max-w-full"
    >
      <div className="scrollbar-none flex w-full min-w-0 items-center gap-1 overflow-x-auto">
        {items.map((item) => {
          const isActive = active === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition whitespace-nowrap",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item}
            </button>
          );
        })}
      </div>
    </GlassSurface>
  );
}
