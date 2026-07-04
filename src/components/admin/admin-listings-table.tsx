"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  PencilSimple,
  Eye,
  EyeSlash,
  TrashSimple,
  Archive,
} from "@phosphor-icons/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { TooltipButton } from "@/components/ui/tooltip-button";
import { EstablishmentIcon } from "@/components/listings/establishment-icon";
import { SortableTableHead, type SortDirection } from "./sortable-table-head";
import {
  deleteListing,
  setListingFeatured,
  setListingStatus,
} from "@/features/listings/actions";
import { listingTypeLabel } from "@/features/listings/constants";
import { formatListingDate } from "@/features/listings/utils";
import type { Listing, ListingStatus } from "@/features/listings/types";
import { cn } from "@/lib/utils";

type AdminListingsTableProps = {
  listings: Listing[];
};

const STATUS_VARIANT: Record<ListingStatus, string> = {
  published: "bg-primary/20 text-primary",
  draft: "bg-white/10 text-muted-foreground",
  expired: "bg-amber-500/20 text-amber-400",
  archived: "bg-white/5 text-muted-foreground/70",
};

type SortKey =
  | "title"
  | "listing_type"
  | "establishment_name"
  | "status"
  | "is_featured"
  | "starts_at"
  | "ends_at";

function compareNullableDates(a: string | null, b: string | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return new Date(a).getTime() - new Date(b).getTime();
}

export function AdminListingsTable({ listings }: AdminListingsTableProps) {
  const [isPending, startTransition] = useTransition();
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sortedListings = useMemo(() => {
    if (!sortKey) return listings;
    const sorted = [...listings].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "title":
        case "listing_type":
        case "establishment_name":
        case "status":
          cmp = a[sortKey].localeCompare(b[sortKey]);
          break;
        case "is_featured":
          cmp = Number(a.is_featured) - Number(b.is_featured);
          break;
        case "starts_at":
        case "ends_at":
          cmp = compareNullableDates(a[sortKey], b[sortKey]);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [listings, sortKey, sortDir]);

  function handleStatusChange(id: string, status: ListingStatus) {
    startTransition(async () => {
      try {
        await setListingStatus(id, status);
        toast.success(`Listing marked as ${status}.`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update listing.");
      }
    });
  }

  function handleFeaturedChange(id: string, isFeatured: boolean) {
    startTransition(async () => {
      try {
        await setListingFeatured(id, isFeatured);
        toast.success(isFeatured ? "Featured." : "Unfeatured.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update listing.");
      }
    });
  }

  function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      try {
        await deleteListing(id);
        toast.success("Listing deleted.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete listing.");
      }
    });
  }

  if (listings.length === 0) {
    return <p className="text-sm text-muted-foreground">No listings yet. Create your first one.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead></TableHead>
            <SortableTableHead
              label="Title"
              sortKey="title"
              activeKey={sortKey}
              direction={sortDir}
              onSort={toggleSort}
            />
            <SortableTableHead
              label="Type"
              sortKey="listing_type"
              activeKey={sortKey}
              direction={sortDir}
              onSort={toggleSort}
            />
            <SortableTableHead
              label="Establishment"
              sortKey="establishment_name"
              activeKey={sortKey}
              direction={sortDir}
              onSort={toggleSort}
            />
            <TableHead>Tags</TableHead>
            <SortableTableHead
              label="Status"
              sortKey="status"
              activeKey={sortKey}
              direction={sortDir}
              onSort={toggleSort}
            />
            <SortableTableHead
              label="Featured"
              sortKey="is_featured"
              activeKey={sortKey}
              direction={sortDir}
              onSort={toggleSort}
            />
            <SortableTableHead
              label="Starts"
              sortKey="starts_at"
              activeKey={sortKey}
              direction={sortDir}
              onSort={toggleSort}
            />
            <SortableTableHead
              label="Ends"
              sortKey="ends_at"
              activeKey={sortKey}
              direction={sortDir}
              onSort={toggleSort}
            />
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedListings.map((listing) => (
            <TableRow key={listing.id}>
              <TableCell>
                <div className="relative size-10 overflow-hidden rounded-lg bg-muted">
                  <Image src={listing.thumbnail_url} alt="" fill className="object-cover" />
                </div>
              </TableCell>
              <TableCell className="max-w-[200px] truncate font-medium">{listing.title}</TableCell>
              <TableCell className="text-muted-foreground">
                {listingTypeLabel(listing.listing_type)}
              </TableCell>
              <TableCell className="max-w-[160px]">
                <div className="flex items-center gap-1.5 truncate text-muted-foreground">
                  <EstablishmentIcon id={listing.establishment_id} className="size-4 shrink-0 rounded" />
                  <span className="truncate">{listing.establishment_name}</span>
                </div>
              </TableCell>
              <TableCell className="max-w-[180px]">
                <div className="flex flex-wrap gap-1">
                  {listing.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                  {listing.tags.length > 3 && (
                    <span className="text-[11px] text-muted-foreground">
                      +{listing.tags.length - 3}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={cn("border-none", STATUS_VARIANT[listing.status])}>
                  {listing.status}
                </Badge>
              </TableCell>
              <TableCell>
                <TooltipButton label={listing.is_featured ? "Unfeature" : "Feature"}>
                  <span className="inline-flex">
                    <Switch
                      checked={listing.is_featured}
                      disabled={isPending}
                      onCheckedChange={(checked) => handleFeaturedChange(listing.id, checked)}
                      aria-label="Toggle featured"
                    />
                  </span>
                </TooltipButton>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatListingDate(listing.starts_at) ?? "—"}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatListingDate(listing.ends_at) ?? "—"}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <TooltipButton label="Edit listing">
                    <Link
                      href={`/admin/listings/${listing.id}/edit`}
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                      aria-label="Edit listing"
                    >
                      <PencilSimple className="size-4" />
                    </Link>
                  </TooltipButton>
                  <TooltipButton label={listing.status === "published" ? "Unpublish" : "Publish"}>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        handleStatusChange(
                          listing.id,
                          listing.status === "published" ? "draft" : "published",
                        )
                      }
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                      aria-label={listing.status === "published" ? "Unpublish" : "Publish"}
                    >
                      {listing.status === "published" ? (
                        <EyeSlash className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </TooltipButton>
                  <TooltipButton label="Archive listing">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleStatusChange(listing.id, "archived")}
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                      aria-label="Archive listing"
                    >
                      <Archive className="size-4" />
                    </button>
                  </TooltipButton>
                  <TooltipButton label="Delete listing">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(listing.id, listing.title)}
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete listing"
                    >
                      <TrashSimple className="size-4" />
                    </button>
                  </TooltipButton>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
