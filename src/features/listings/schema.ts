import { z } from "zod";

const LISTING_TYPE_VALUES = ["event", "deal"] as const;

const STATUS_VALUES = ["draft", "published", "expired", "archived"] as const;

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const requiredHttpUrl = z
  .string()
  .trim()
  .min(1, "Required")
  .refine(isHttpUrl, "Must be a valid http:// or https:// URL");

const optionalText = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((v) => (v && v.length > 0 ? v : null));

// datetime-local inputs come through as "" or "2026-06-30T18:00"; normalize to
// an ISO string or null for storage.
const optionalDateTime = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || !Number.isNaN(Date.parse(v)), "Must be a valid date")
  .transform((v) => (v ? new Date(v).toISOString() : null));

// The tag chip input syncs its selections into one hidden comma-joined
// input, so this stays a simple split/trim/filter transform.
const tagsInput = z
  .string()
  .optional()
  .nullable()
  .transform((v) =>
    (v ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  );

export const listingFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  listing_type: z.enum(LISTING_TYPE_VALUES, { message: "Choose a listing type" }),
  location: optionalText,
  starts_at: optionalDateTime,
  ends_at: optionalDateTime,
  tags: tagsInput,
  source_url: requiredHttpUrl,
  cta_label: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : "Open Link")),
  establishment_id: optionalText,
  establishment_name: z.string().trim().min(1, "Establishment name is required"),
  is_featured: z.coerce.boolean().optional().default(false),
});

export type ListingFormInput = z.input<typeof listingFormSchema>;
export type ListingFormOutput = z.output<typeof listingFormSchema>;

export const listingStatusSchema = z.enum(STATUS_VALUES);

export const listingIdSchema = z.string().uuid();
