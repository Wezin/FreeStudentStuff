import { MagnifyingGlass } from "@phosphor-icons/react/ssr";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-foreground/5">
        <MagnifyingGlass className="size-5 text-muted-foreground" />
      </div>
      <p className="max-w-xs text-balance text-sm text-muted-foreground">
        No listings found. Try another school, category, or search.
      </p>
    </div>
  );
}
