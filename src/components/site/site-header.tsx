"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { MagnifyingGlass, Lightning } from "@phosphor-icons/react";
import { GlassSurface } from "@/components/glass/glass-surface";
import { TooltipButton } from "@/components/ui/tooltip-button";

type SiteHeaderProps = {
  onSearch: (query: string) => void;
};

export function SiteHeader({ onSearch }: SiteHeaderProps) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(value.trim());
  }

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="mx-auto flex max-w-6xl items-center gap-2 sm:gap-3">
        <GlassSurface
          cornerRadius={28}
          padding="0.5rem 0.75rem"
          className="flex flex-1 items-center gap-2 sm:gap-4"
        >
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1.5 px-1.5 py-1 font-semibold tracking-tight text-foreground"
          >
            <Lightning weight="fill" className="size-5 text-primary" />
            <span className="hidden sm:inline">Free Plug</span>
          </Link>

          <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-2">
            <label htmlFor="site-search" className="sr-only">
              Search listings
            </label>
            <div className="flex w-full items-center gap-2 rounded-full bg-foreground/5 px-3 py-1.5">
              <MagnifyingGlass className="size-4 shrink-0 text-muted-foreground" />
              <input
                id="site-search"
                type="search"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (e.target.value === "") onSearch("");
                }}
                placeholder="Search free food, events, deals, scholarships..."
                className="w-full min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <TooltipButton label="Search">
              <button
                type="submit"
                aria-label="Search"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90"
              >
                <MagnifyingGlass className="size-4" />
              </button>
            </TooltipButton>
          </form>
        </GlassSurface>
      </div>
    </header>
  );
}
