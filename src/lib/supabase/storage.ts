import "server-only";
import { createAdminClient } from "./admin";
import { assertSafeUrl } from "@/lib/import/security";

const BUCKET = "public_bucket";
const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // 6MB
const IMAGE_FETCH_TIMEOUT_MS = 8000;

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

/**
 * Fetches an image from an external URL (e.g. og:image extracted by the
 * link importer) server-side and re-hosts it in our own bucket, so
 * published listings never depend on a third-party site staying up. Runs
 * the same SSRF guardrails as the page fetcher since this is also an
 * admin-triggered fetch of an arbitrary external URL.
 */
export async function uploadListingThumbnailFromUrl(sourceUrl: string): Promise<string> {
  const url = await assertSafeUrl(sourceUrl);

  const response = await fetch(url, {
    method: "GET",
    redirect: "follow",
    credentials: "omit",
    signal: AbortSignal.timeout(IMAGE_FETCH_TIMEOUT_MS),
    headers: { "User-Agent": "FreePlugImporterBot/1.0 (+https://freeplug.app)" },
  }).catch(() => {
    throw new Error("Could not download the image from that URL.");
  });

  if (!response.ok) {
    throw new Error("Could not download the image from that URL.");
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    throw new Error("That URL doesn't point to an image.");
  }

  const contentLength = Number(response.headers.get("content-length") ?? 0);
  if (contentLength > MAX_IMAGE_BYTES) {
    throw new Error("That image is too large.");
  }

  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new Error("That image is too large.");
  }

  const extension = contentType.split("/")[1]?.split(";")[0] || "jpg";
  const supabase = createAdminClient();
  const path = `listings/${crypto.randomUUID()}-imported.${sanitizeFilename(extension)}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType,
    upsert: false,
  });

  if (error) {
    throw new Error(`Failed to upload thumbnail: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
