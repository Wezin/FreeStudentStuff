import "server-only";
import { findBestImage } from "./find-image";

export type CandidateBlock = {
  /** 1-based — referenced by the LLM so it never has to retype a URL. */
  index: number;
  href: string;
  linkText: string;
  heading: string | null;
  imageUrl: string | null;
  dateHint: string | null;
  snippet: string;
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
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

/** Drops nav/footer/header/script/style content so boilerplate links (menus,
 *  social icons, legal links) don't crowd out actual listing candidates. */
function stripBoilerplateSections(html: string): string {
  return html
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
}

const NAV_TEXT_DENYLIST = new Set([
  "home", "about", "about us", "contact", "contact us", "login", "log in", "sign in",
  "sign up", "register", "menu", "search", "privacy policy", "privacy", "terms",
  "terms of service", "terms & conditions", "cookie policy", "cookies", "accessibility",
  "sitemap", "careers", "faq", "help", "subscribe", "newsletter", "back to top",
  "skip to content", "share", "print", "close",
]);

const BLOCKED_HOSTS = [
  "facebook.com", "twitter.com", "x.com", "instagram.com", "linkedin.com",
  "youtube.com", "tiktok.com", "pinterest.com", "reddit.com",
];

const MONTH = "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\.?";
const DATE_HINT_RE = new RegExp(
  `\\b${MONTH}\\s+\\d{1,2}(?:st|nd|rd|th)?(?:,?\\s*\\d{4})?\\b` +
    `|\\b\\d{1,2}\\/\\d{1,2}\\/\\d{2,4}\\b` +
    `|\\b\\d{4}-\\d{2}-\\d{2}\\b` +
    `|\\b(?:Today|Tomorrow|Tonight)\\b` +
    `|\\b\\d{1,2}:\\d{2}\\s*(?:AM|PM|am|pm)\\b`,
  "i",
);

/**
 * Many event-listing platforms (WordPress "The Events Calendar" and similar
 * plugins, ticketing sites, etc.) embed a JSON-LD array with every event's
 * title/description/image/url/dates directly on the directory page — a far
 * more reliable source than trying to spot an <img> near each link, and one
 * we already have for free since we already fetched this page.
 */
type JsonLdEventInfo = {
  image: string | null;
  startDate: string | null;
  description: string | null;
  name: string | null;
};

function jsonLdImageUrl(image: unknown): string | null {
  if (typeof image === "string") return image;
  if (Array.isArray(image)) return jsonLdImageUrl(image[0]);
  if (image && typeof image === "object") {
    const url = (image as Record<string, unknown>).url;
    if (typeof url === "string") return url;
  }
  return null;
}

function extractJsonLdEvents(html: string): Map<string, JsonLdEventInfo> {
  const events = new Map<string, JsonLdEventInfo>();
  const scriptRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = scriptRe.exec(html))) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(match[1].trim());
    } catch {
      continue;
    }

    const graph = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>)["@graph"] : undefined;
    const items: unknown[] = Array.isArray(parsed) ? parsed : Array.isArray(graph) ? graph : [parsed];

    for (const item of items) {
      if (!item || typeof item !== "object") continue;
      const rec = item as Record<string, unknown>;
      const type = rec["@type"];
      const isEvent =
        typeof type === "string"
          ? type.toLowerCase().includes("event")
          : Array.isArray(type) && type.some((t) => typeof t === "string" && t.toLowerCase().includes("event"));
      if (!isEvent) continue;

      const url = typeof rec.url === "string" ? rec.url : null;
      if (!url) continue;

      events.set(url, {
        image: jsonLdImageUrl(rec.image),
        startDate: typeof rec.startDate === "string" ? rec.startDate : null,
        description: typeof rec.description === "string" ? rec.description : null,
        name: typeof rec.name === "string" ? rec.name : null,
      });
    }
  }

  return events;
}

const ANCHOR_RE = /<a\b[^>]*?href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
const HEADING_RE = /<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi;

const CONTEXT_WINDOW = 400;
// Kept modest — this bounds both the prompt size and how many structured
// candidates Gemini has to produce in one call, which is the main driver of
// latency (a full 80-block page took 100s+ in testing). Most real deal/event
// directory pages have far fewer genuine cards than this cap anyway.
const MAX_BLOCKS = 50;

function resolveUrl(href: string, base: string): string | null {
  try {
    const url = new URL(href, base);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function isBlockedHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return BLOCKED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return true;
  }
}

type RawBlock = {
  href: string;
  linkText: string;
  imageUrl: string | null;
  heading: string | null;
  dateHint: string | null;
  snippet: string;
  score: number;
};

/**
 * Mechanically surfaces plausible "card" anchors from a directory-style
 * page — each link plus whatever heading/image/date-like text sits near it.
 * Deliberately generous rather than precise: this just narrows a whole page
 * down to a bounded, structured candidate list for the LLM to actually
 * judge — it isn't expected to reliably distinguish real listings from
 * navigation on its own.
 */
export function extractCandidateBlocks(html: string, pageUrl: string): CandidateBlock[] {
  const cleaned = stripBoilerplateSections(html);
  const raw: RawBlock[] = [];

  let match: RegExpExecArray | null;
  ANCHOR_RE.lastIndex = 0;
  while ((match = ANCHOR_RE.exec(cleaned))) {
    const [full, hrefRaw, inner] = match;
    const href = resolveUrl(hrefRaw, pageUrl);
    if (!href || isBlockedHost(href)) continue;

    const linkText = stripTags(inner);
    const bestImage = findBestImage(inner);
    const imageUrl = bestImage ? resolveUrl(bestImage, pageUrl) : null;

    if (!imageUrl && linkText.length < 3) continue;
    if (NAV_TEXT_DENYLIST.has(linkText.toLowerCase())) continue;

    const windowStart = Math.max(0, match.index - CONTEXT_WINDOW);
    const windowEnd = Math.min(cleaned.length, match.index + full.length + CONTEXT_WINDOW);
    const before = cleaned.slice(windowStart, match.index);
    const after = cleaned.slice(match.index + full.length, windowEnd);

    let heading: string | null = null;
    HEADING_RE.lastIndex = 0;
    let h: RegExpExecArray | null;
    while ((h = HEADING_RE.exec(before))) {
      const text = stripTags(h[1]);
      if (text) heading = text;
    }

    const dateHaystack = `${stripTags(before.slice(-200))} ${linkText} ${stripTags(after.slice(0, 200))}`;
    const dateHint = dateHaystack.match(DATE_HINT_RE)?.[0] ?? null;

    const snippet = [linkText, stripTags(after.slice(0, 200))].filter(Boolean).join(" — ").slice(0, 300);

    const score =
      (imageUrl ? 2 : 0) + (dateHint ? 2 : 0) + (heading ? 1 : 0) + Math.min(linkText.length / 20, 2);

    raw.push({ href, linkText, imageUrl, heading, dateHint, snippet, score });
  }

  // Merge duplicate anchors pointing at the same href — a common card
  // pattern wraps the image and the title in two separate <a> tags.
  const byHref = new Map<string, RawBlock>();
  for (const block of raw) {
    const existing = byHref.get(block.href);
    if (!existing) {
      byHref.set(block.href, { ...block });
      continue;
    }
    existing.imageUrl = existing.imageUrl ?? block.imageUrl;
    existing.heading = existing.heading ?? block.heading;
    existing.dateHint = existing.dateHint ?? block.dateHint;
    if (block.linkText.length > existing.linkText.length) existing.linkText = block.linkText;
    existing.score = Math.max(existing.score, block.score);
  }

  // Fill in gaps (mainly images, which card layouts frequently don't nest
  // next to their link) from JSON-LD, and add any event JSON-LD knows about
  // that the anchor scan missed entirely.
  for (const [rawUrl, info] of extractJsonLdEvents(html)) {
    const resolvedUrl = resolveUrl(rawUrl, pageUrl);
    if (!resolvedUrl) continue;

    const existing = byHref.get(resolvedUrl);
    if (existing) {
      if (!existing.imageUrl && info.image) {
        const resolvedImage = resolveUrl(info.image, pageUrl);
        if (resolvedImage) {
          existing.imageUrl = resolvedImage;
          existing.score += 2;
        }
      }
      if (!existing.dateHint && info.startDate) {
        existing.dateHint = info.startDate;
        existing.score += 1;
      }
      continue;
    }

    const linkText = info.name ?? "";
    if (!linkText) continue;
    byHref.set(resolvedUrl, {
      href: resolvedUrl,
      linkText,
      imageUrl: info.image ? (resolveUrl(info.image, pageUrl) ?? null) : null,
      heading: null,
      dateHint: info.startDate,
      snippet: [linkText, info.description ? stripTags(info.description) : null].filter(Boolean).join(" — ").slice(0, 300),
      score: 3,
    });
  }

  return [...byHref.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_BLOCKS)
    .map((b, i) => ({
      index: i + 1,
      href: b.href,
      linkText: b.linkText,
      heading: b.heading,
      imageUrl: b.imageUrl,
      dateHint: b.dateHint,
      snippet: b.snippet,
    }));
}
