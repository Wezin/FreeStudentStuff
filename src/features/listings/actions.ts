"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/features/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadListingThumbnail, uploadListingThumbnailFromUrl } from "@/lib/supabase/storage";
import { listingFormSchema, listingIdSchema } from "./schema";
import { slugExists } from "./queries";
import { slugify } from "./utils";
import type { ListingStatus } from "./types";

export type ListingActionState = {
  error: string | null;
  fieldErrors?: Record<string, string>;
};

async function uniqueSlugFor(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title) || "listing";
  let candidate = base;
  let attempt = 1;
  while (await slugExists(candidate, excludeId)) {
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }
  return candidate;
}

function parseListingForm(formData: FormData) {
  return listingFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    listing_type: formData.get("listing_type"),
    location: formData.get("location"),
    starts_at: formData.get("starts_at"),
    ends_at: formData.get("ends_at"),
    tags: formData.get("tags"),
    source_url: formData.get("source_url"),
    cta_label: formData.get("cta_label"),
    establishment_id: formData.get("establishment_id"),
    establishment_name: formData.get("establishment_name"),
    is_featured: formData.get("is_featured"),
  });
}

function flattenFieldErrors(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

/** Extracts the uploaded thumbnail file from FormData, if a real file was chosen. */
function getThumbnailFile(formData: FormData): File | null {
  const file = formData.get("thumbnail");
  return file instanceof File && file.size > 0 ? file : null;
}

/** "draft" (pending) or "published" (approved) — defaults to draft so the
 *  plain manual-add form (which never sets this field) is unaffected. */
function getRequestedStatus(formData: FormData): "draft" | "published" {
  return formData.get("requested_status") === "published" ? "published" : "draft";
}

/**
 * Resolves the thumbnail to store, in priority order: a freshly uploaded
 * file, an external URL to re-host (from the link importer), or — on
 * update only — the listing's existing already-uploaded thumbnail.
 */
async function resolveThumbnailUrl(
  formData: FormData,
  existingThumbnailUrl?: string,
): Promise<{ url: string } | { fieldError: string }> {
  const file = getThumbnailFile(formData);
  if (file) {
    try {
      return { url: await uploadListingThumbnail(file) };
    } catch (err) {
      return { fieldError: err instanceof Error ? err.message : "Failed to upload thumbnail." };
    }
  }

  const sourceUrl = formData.get("thumbnail_source_url");
  if (typeof sourceUrl === "string" && sourceUrl.trim()) {
    try {
      return { url: await uploadListingThumbnailFromUrl(sourceUrl.trim()) };
    } catch (err) {
      return { fieldError: err instanceof Error ? err.message : "Failed to import thumbnail." };
    }
  }

  if (existingThumbnailUrl) {
    return { url: existingThumbnailUrl };
  }

  return { fieldError: "A thumbnail image is required" };
}

export async function createListing(
  _prevState: ListingActionState,
  formData: FormData,
): Promise<ListingActionState> {
  await requireAdmin();

  const parsed = parseListingForm(formData);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const thumbnail = await resolveThumbnailUrl(formData);
  if ("fieldError" in thumbnail) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: { thumbnail: thumbnail.fieldError },
    };
  }

  const slug = await uniqueSlugFor(parsed.data.title);
  const supabase = createAdminClient();
  const { error } = await supabase.from("listings").insert({
    ...parsed.data,
    slug,
    thumbnail_url: thumbnail.url,
    status: getRequestedStatus(formData),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function updateListing(
  id: string,
  _prevState: ListingActionState,
  formData: FormData,
): Promise<ListingActionState> {
  await requireAdmin();
  listingIdSchema.parse(id);

  const parsed = parseListingForm(formData);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const existingThumbnailUrl = formData.get("existing_thumbnail_url");
  const thumbnail = await resolveThumbnailUrl(
    formData,
    typeof existingThumbnailUrl === "string" ? existingThumbnailUrl : undefined,
  );
  if ("fieldError" in thumbnail) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: { thumbnail: thumbnail.fieldError },
    };
  }

  const slug = await uniqueSlugFor(parsed.data.title, id);
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("listings")
    .update({ ...parsed.data, slug, thumbnail_url: thumbnail.url })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function deleteListing(id: string): Promise<void> {
  await requireAdmin();
  listingIdSchema.parse(id);

  const supabase = createAdminClient();
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function setListingStatus(id: string, status: ListingStatus): Promise<void> {
  await requireAdmin();
  listingIdSchema.parse(id);

  const supabase = createAdminClient();

  if (status === "published") {
    const { data: listing, error: fetchError } = await supabase
      .from("listings")
      .select("thumbnail_url, source_url, establishment_name")
      .eq("id", id)
      .maybeSingle();
    if (fetchError) throw new Error(fetchError.message);
    if (!listing?.thumbnail_url || !listing?.source_url || !listing?.establishment_name) {
      throw new Error(
        "Cannot publish a listing without a thumbnail, source URL, and establishment name.",
      );
    }
  }

  const { error } = await supabase.from("listings").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function setListingFeatured(id: string, isFeatured: boolean): Promise<void> {
  await requireAdmin();
  listingIdSchema.parse(id);

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("listings")
    .update({ is_featured: isFeatured })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/");
}
