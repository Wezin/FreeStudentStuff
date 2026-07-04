"use client";

import { useActionState, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "./tag-input";
import { EstablishmentPicker } from "./establishment-picker";
import {
  CTA_LABEL_SUGGESTIONS,
  DEFAULT_CTA_LABEL,
  LISTING_TYPES,
} from "@/features/listings/constants";
import type { ListingActionState } from "@/features/listings/actions";
import type { Listing, ListingType } from "@/features/listings/types";
import { cn } from "@/lib/utils";

const initialState: ListingActionState = { error: null };

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

type AdminListingFormProps = {
  action: (state: ListingActionState, formData: FormData) => Promise<ListingActionState>;
  listing?: Listing;
  tagSuggestions: string[];
};

export function AdminListingForm({ action, listing, tagSuggestions }: AdminListingFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [listingType, setListingType] = useState<ListingType>(listing?.listing_type ?? "event");
  const [hasDeadline, setHasDeadline] = useState(
    listing?.listing_type === "deal" ? Boolean(listing?.ends_at) : false,
  );
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    listing?.thumbnail_url ?? null,
  );

  function handleThumbnailChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setThumbnailPreview(URL.createObjectURL(file));
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-8">
      <section className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={listing?.title} required />
          <FieldError message={state.fieldErrors?.title} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={listing?.description}
            required
          />
          <FieldError message={state.fieldErrors?.description} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location (optional)</Label>
          <Input id="location" name="location" defaultValue={listing?.location ?? ""} />
        </div>
      </section>

      <section className="space-y-4 border-t border-border pt-6">
        <div className="space-y-2">
          <Label>Listing type</Label>
          <input type="hidden" name="listing_type" value={listingType} />
          <div className="inline-flex rounded-full border border-input p-1">
            {LISTING_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setListingType(t.value)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition",
                  listingType === t.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {listingType === "event" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="starts_at">Start date</Label>
              <Input
                id="starts_at"
                name="starts_at"
                type="datetime-local"
                defaultValue={toDatetimeLocalValue(listing?.starts_at ?? null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ends_at">End date</Label>
              <Input
                id="ends_at"
                name="ends_at"
                type="datetime-local"
                defaultValue={toDatetimeLocalValue(listing?.ends_at ?? null)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Switch id="has_deadline" checked={hasDeadline} onCheckedChange={setHasDeadline} />
              <Label htmlFor="has_deadline">Has a deadline</Label>
            </div>
            {hasDeadline && (
              <div className="space-y-2">
                <Label htmlFor="ends_at">Deadline</Label>
                <Input
                  id="ends_at"
                  name="ends_at"
                  type="datetime-local"
                  defaultValue={toDatetimeLocalValue(listing?.ends_at ?? null)}
                />
              </div>
            )}
          </div>
        )}
      </section>

      <section className="space-y-2 border-t border-border pt-6">
        <Label>Tags</Label>
        <TagInput name="tags" defaultValue={listing?.tags ?? []} suggestions={tagSuggestions} />
      </section>

      <section className="space-y-2 border-t border-border pt-6">
        <Label htmlFor="thumbnail">Thumbnail</Label>
        <input type="hidden" name="existing_thumbnail_url" value={listing?.thumbnail_url ?? ""} />
        <input
          id="thumbnail"
          name="thumbnail"
          type="file"
          accept="image/*"
          onChange={handleThumbnailChange}
          className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-secondary file:px-4 file:py-2 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-muted"
        />
        <FieldError message={state.fieldErrors?.thumbnail} />
        {thumbnailPreview && (
          <div className="relative mt-2 aspect-video w-full max-w-xs overflow-hidden rounded-xl bg-muted">
            <Image src={thumbnailPreview} alt="Preview" fill className="object-cover" unoptimized />
          </div>
        )}
      </section>

      <section className="border-t border-border pt-6">
        <EstablishmentPicker
          defaultEstablishmentId={listing?.establishment_id}
          defaultEstablishmentName={listing?.establishment_name}
        />
        <FieldError message={state.fieldErrors?.establishment_name} />
      </section>

      <section className="space-y-4 border-t border-border pt-6">
        <div className="space-y-2">
          <Label htmlFor="source_url">Source URL</Label>
          <Input
            id="source_url"
            name="source_url"
            defaultValue={listing?.source_url}
            placeholder="https://..."
            required
          />
          <FieldError message={state.fieldErrors?.source_url} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cta_label">CTA Label</Label>
          <Input
            id="cta_label"
            name="cta_label"
            list="cta-label-suggestions"
            defaultValue={listing?.cta_label ?? DEFAULT_CTA_LABEL}
          />
          <datalist id="cta-label-suggestions">
            {CTA_LABEL_SUGGESTIONS.map((label) => (
              <option key={label} value={label} />
            ))}
          </datalist>
        </div>
      </section>

      <section className="flex items-center gap-3 border-t border-border pt-6">
        <Switch id="is_featured" name="is_featured" defaultChecked={listing?.is_featured} />
        <Label htmlFor="is_featured">Featured</Label>
      </section>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Saving..." : listing ? "Save changes" : "Create listing"}
      </button>
    </form>
  );
}
