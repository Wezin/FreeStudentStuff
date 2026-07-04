import { Lightning } from "@phosphor-icons/react/ssr";
import { SubmitListingModal } from "@/components/listings/submit-listing-modal";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Lightning weight="fill" className="size-5 text-primary" />
          Free Plug
        </div>
        <p className="max-w-md text-balance text-sm text-muted-foreground">
          Know about a free event, student deal, free food drop, scholarship,
          hackathon, club thing, or student opportunity? Drop the details
          here.
        </p>
        <SubmitListingModal
          trigger={
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Submit a freebie/event
            </button>
          }
        />
        <p className="text-xs text-muted-foreground">
          A curated board for Carleton, uOttawa, Algonquin, and Ottawa
          students. Not affiliated with any university.
        </p>
        <ThemeToggle />
      </div>
    </footer>
  );
}
