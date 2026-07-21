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
    <div className="min-w-0 flex-1 overflow-hidden">
      <GlassSurface
        cornerRadius={999}
        padding="0.25rem"
        className="flex w-max max-w-full min-w-0 items-center"
      >
        <div className="scrollbar-none flex min-w-0 max-w-full touch-pan-x items-center gap-0.5 overflow-x-auto overscroll-x-contain">
          {items.map((item) => {
            const isActive = active === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onSelect(item)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-sm font-medium transition whitespace-nowrap",
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
    </div>
  );
}
