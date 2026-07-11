import { ListingCard } from "./listing-card";
import { EmptyState } from "./empty-state";
import type { Listing } from "@/features/listings/types";

type ListingGridProps = {
  listings: Listing[];
};

export function ListingGrid({ listings }: ListingGridProps) {
  if (listings.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-3 sm:gap-4 sm:px-6 lg:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} fluid sectionId="grid" />
      ))}
    </div>
  );
}
