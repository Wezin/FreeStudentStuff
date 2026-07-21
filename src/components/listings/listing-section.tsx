"use client";

import { CaretRight } from "@phosphor-icons/react";
import type { ReactNode } from "react";

type ListingSectionProps = {
  title: string;
  onSeeAll?: () => void;
  children: ReactNode;
};

export function ListingSection({ title, onSeeAll, children }: ListingSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-4 sm:px-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {title}
        </h2>
        {onSeeAll ? (
          <button
            type="button"
            onClick={onSeeAll}
            className="flex items-center gap-0.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            See All
            <CaretRight className="size-3.5" aria-hidden />
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}
