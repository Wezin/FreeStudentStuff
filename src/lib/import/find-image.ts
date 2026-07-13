import "server-only";

// Common lazy-loading attribute names (lazysizes and similar libraries) that
// hold the real image while `src` holds a throwaway placeholder — checked in
// this order, first match wins.
const LAZY_ATTR_NAMES = ["data-src", "data-lazy-src", "data-lazy", "data-original", "data-srcset", "srcset"];

const LOGO_HINT_RE = /\b(logo|icon|sprite|avatar|placeholder)\b/i;

function attrValue(tag: string, name: string): string | null {
  const re = new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i");
  return tag.match(re)?.[1] ?? null;
}

function firstUrlFromSrcset(value: string): string | null {
  return value.split(",")[0]?.trim().split(/\s+/)[0] ?? null;
}

/**
 * Picks the best real image out of a chunk of HTML's <img> tags.
 *
 * Two problems this specifically works around, both very common across real
 * sites (not specific to any one page):
 * - Lazy-loading: `src` holds a tiny placeholder (often a base64 blank GIF)
 *   and the real image lives in a `data-src`/`srcset`-style attribute
 *   instead — a near-universal pattern (lazysizes and similar libraries).
 *   Scraping raw `src` alone finds nothing usable.
 * - The "first <img> on the page" fallback tends to grab a site's nav/header
 *   logo, since that's almost always the very first <img> in the markup,
 *   long before any actual content image.
 */
export function findBestImage(html: string): string | null {
  const imgTags = html.match(/<img\b[^>]*>/gi) ?? [];
  const candidates: { url: string; isLogo: boolean }[] = [];

  for (const tag of imgTags) {
    const src = attrValue(tag, "src");
    let url: string | null = null;

    for (const attr of LAZY_ATTR_NAMES) {
      const value = attrValue(tag, attr);
      if (!value) continue;
      url = attr.includes("srcset") ? firstUrlFromSrcset(value) : value;
      if (url) break;
    }

    if (!url) {
      if (!src || src.startsWith("data:")) continue;
      url = src;
    }

    candidates.push({ url, isLogo: LOGO_HINT_RE.test(tag) });
  }

  return candidates.find((c) => !c.isLogo)?.url ?? candidates[0]?.url ?? null;
}
