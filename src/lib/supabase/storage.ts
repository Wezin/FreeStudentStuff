import "server-only";
import { createAdminClient } from "./admin";

const BUCKET = "public_bucket";

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/** Uploads a listing thumbnail to Supabase Storage and returns its public URL. */
export async function uploadListingThumbnail(file: File): Promise<string> {
  const supabase = createAdminClient();
  const path = `listings/${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(`Failed to upload thumbnail: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
