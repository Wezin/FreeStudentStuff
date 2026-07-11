import "server-only";

export type ExtractedListingDraft = {
  title: string | null;
  description: string | null;
  location: string | null;
  starts_at: string | null;
  ends_at: string | null;
  image_url: string | null;
  site_name: string | null;
};

const EMPTY_DRAFT: ExtractedListingDraft = {
  title: null,
  description: null,
  location: null,
  starts_at: null,
  ends_at: null,
  image_url: null,
  site_name: null,
};

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .trim();
}

function toIsoOrNull(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function firstNonEmpty(...values: (string | null | undefined)[]): string | null {
  for (const v of values) {
    if (v && v.trim()) return v.trim();
  }
  return null;
}

// --- JSON-LD (schema.org Event) --------------------------------------------

function extractJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const scriptRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = scriptRe.exec(html))) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (Array.isArray(parsed)) blocks.push(...parsed);
      else if (parsed && Array.isArray((parsed as { "@graph"?: unknown[] })["@graph"])) {
        blocks.push(...(parsed as { "@graph": unknown[] })["@graph"]);
      } else if (parsed) blocks.push(parsed);
    } catch {
      // Malformed JSON-LD — skip this block, not fatal for the whole import.
    }
  }
  return blocks;
}

function nodeIsType(node: unknown, type: string): boolean {
  if (!node || typeof node !== "object") return false;
  const t = (node as Record<string, unknown>)["@type"];
  if (typeof t === "string") return t.toLowerCase().includes(type.toLowerCase());
  if (Array.isArray(t)) return t.some((x) => typeof x === "string" && x.toLowerCase().includes(type.toLowerCase()));
  return false;
}

function jsonLdImageUrl(image: unknown): string | null {
  if (typeof image === "string") return image;
  if (Array.isArray(image)) return jsonLdImageUrl(image[0]);
  if (image && typeof image === "object") {
    const url = (image as Record<string, unknown>).url;
    if (typeof url === "string") return url;
  }
  return null;
}

function jsonLdLocationText(location: unknown): string | null {
  if (typeof location === "string") return location;
  if (Array.isArray(location)) return jsonLdLocationText(location[0]);
  if (location && typeof location === "object") {
    const rec = location as Record<string, unknown>;
    const name = typeof rec.name === "string" ? rec.name : null;
    const address = rec.address;
    if (typeof address === "string") return firstNonEmpty(name, address);
    if (address && typeof address === "object") {
      const a = address as Record<string, unknown>;
      const parts = [a.streetAddress, a.addressLocality, a.addressRegion]
        .filter((p): p is string => typeof p === "string" && p.length > 0);
      return firstNonEmpty(name, parts.join(", "));
    }
    return name;
  }
  return null;
}

function jsonLdOrgName(node: Record<string, unknown>): string | null {
  const org = node.organizer ?? node.publisher ?? node.provider;
  if (typeof org === "string") return org;
  if (org && typeof org === "object") {
    const name = (org as Record<string, unknown>).name;
    if (typeof name === "string") return name;
  }
  return null;
}

function extractFromJsonLd(html: string): Partial<ExtractedListingDraft> {
  const blocks = extractJsonLdBlocks(html);
  const event = blocks.find((b) => nodeIsType(b, "event")) as Record<string, unknown> | undefined;
  if (!event) return {};

  return {
    title: typeof event.name === "string" ? event.name : null,
    description: typeof event.description === "string" ? decodeEntities(event.description) : null,
    location: jsonLdLocationText(event.location),
    starts_at: toIsoOrNull(event.startDate),
    ends_at: toIsoOrNull(event.endDate),
    image_url: jsonLdImageUrl(event.image),
    site_name: jsonLdOrgName(event),
  };
}

// --- Open Graph / Twitter meta tags -----------------------------------------

function extractMetaTags(html: string): Record<string, string> {
  const tags: Record<string, string> = {};
  const metaRe = /<meta\s+[^>]*>/gi;
  const nameRe = /(?:property|name)\s*=\s*["']([^"']+)["']/i;
  const contentRe = /content\s*=\s*["']([^"']*)["']/i;

  for (const tagMatch of html.matchAll(metaRe)) {
    const tag = tagMatch[0];
    const name = tag.match(nameRe)?.[1]?.toLowerCase();
    const content = tag.match(contentRe)?.[1];
    if (name && content !== undefined) tags[name] = decodeEntities(content);
  }
  return tags;
}

function extractFromOpenGraph(html: string): Partial<ExtractedListingDraft> {
  const tags = extractMetaTags(html);
  return {
    title: firstNonEmpty(tags["og:title"], tags["twitter:title"]),
    description: firstNonEmpty(tags["og:description"], tags["twitter:description"], tags["description"]),
    image_url: firstNonEmpty(tags["og:image"], tags["twitter:image"]),
    site_name: tags["og:site_name"] ?? null,
  };
}

// --- Basic HTML fallback -----------------------------------------------------

function extractFromBasicHtml(html: string): Partial<ExtractedListingDraft> {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1];
  const timeDatetime = html.match(/<time[^>]+datetime=["']([^"']+)["']/i)?.[1];
  const img = html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];

  const stripTags = (s?: string) => (s ? decodeEntities(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")) : null);

  return {
    title: firstNonEmpty(stripTags(h1), stripTags(title)),
    description: description ? decodeEntities(description) : null,
    starts_at: toIsoOrNull(timeDatetime),
    image_url: img ?? null,
  };
}

function mergeDrafts(...drafts: Partial<ExtractedListingDraft>[]): ExtractedListingDraft {
  const merged = { ...EMPTY_DRAFT };
  for (const key of Object.keys(EMPTY_DRAFT) as (keyof ExtractedListingDraft)[]) {
    for (const draft of drafts) {
      if (draft[key]) {
        merged[key] = draft[key] as never;
        break;
      }
    }
  }
  return merged;
}

/**
 * Priority order: JSON-LD Event > Open Graph/Twitter meta > basic HTML tags.
 * Each stage only fills in fields the previous stage left empty, so a page
 * with partial JSON-LD still benefits from OG/basic fallbacks for the rest.
 */
export function extractListingDraft(html: string, pageUrl: string): ExtractedListingDraft {
  const draft = mergeDrafts(
    extractFromJsonLd(html),
    extractFromOpenGraph(html),
    extractFromBasicHtml(html),
  );

  if (draft.image_url) {
    try {
      draft.image_url = new URL(draft.image_url, pageUrl).toString();
    } catch {
      draft.image_url = null;
    }
  }

  return draft;
}
