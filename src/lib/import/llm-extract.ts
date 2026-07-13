import "server-only";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { ALL_ESTABLISHMENTS } from "@/features/listings/establishments";
import { INITIAL_TAGS } from "@/features/listings/constants";

// Free-tier model — this runs on every "Fetch & extract" click and the task
// (structured extraction from a single page's text) doesn't need a frontier
// model. Override via env for a different model.
const MODEL = process.env.IMPORT_LLM_MODEL || "gemini-2.5-flash";
const MAX_INPUT_CHARS = 12000;

const extractionSchema = z.object({
  title: z
    .string()
    .nullable()
    .describe(
      "A clear, appropriately concise title for this listing as it should appear on a " +
        "student deals/events board. Reuse the page's own title/headline only if it's " +
        "already good; otherwise rewrite it — strip site-name suffixes (e.g. ' | Eventbrite'), " +
        "clickbait, ALL CAPS, or vague phrasing, and instead describe what the listing " +
        "actually is. Null only if the page truly has no identifiable subject.",
    ),
  description: z
    .string()
    .nullable()
    .describe(
      "A 1-3 sentence description of the listing. There doesn't need to be a dedicated " +
        "'description' section on the page — piece one together from whatever surrounding " +
        "context is available (headings, event details, host info, etc.). Null only if the " +
        "page genuinely has nothing to go on.",
    ),
  location: z
    .string()
    .nullable()
    .describe(
      "Venue name or address. Null if the listing is fully online/virtual/remote " +
        "(webinar, livestream, online-only promo code, etc.) — do not write 'Online' or " +
        "'Virtual' here; use the \"Online\" tag for that instead.",
    ),
  listing_type: z.enum(["event", "deal"]),
  starts_at: z
    .string()
    .nullable()
    .describe(
      "ISO 8601 datetime for when the event starts (first day/time, if multi-day). Null " +
        "for deals, or if no date/time is actually stated. Resolve relative dates " +
        "(\"this Friday\", \"March 5\") against the current date given below — assume " +
        "Eastern Time (America/Toronto) if no timezone is stated.",
    ),
  ends_at: z
    .string()
    .nullable()
    .describe(
      "For events: the end date/time (final day/time, if multi-day) — only set this if " +
        "an end is actually stated; don't guess one for a single-day event with no stated " +
        "end. For deals: the deadline/expiration date, or null if open-ended/ongoing.",
    ),
  tags: z
    .array(z.string())
    .describe(
      "Applicable tags — aim for around 5 when the content supports it. Prefer matches " +
        "from the provided list; if that doesn't cover enough ground, add a few more " +
        "short, specific keyword tags for the listing's topic/interest area. Don't pad " +
        "with irrelevant tags just to hit a number.",
    ),
  establishment_id: z
    .string()
    .nullable()
    .describe("The id of a matching establishment from the provided list, or null"),
  establishment_name: z
    .string()
    .nullable()
    .describe("The host/organizer's display name, or null if truly unknown"),
  cta_label: z.string().describe('Short call-to-action button label, e.g. "Register"'),
});

const responseJsonSchema = z.toJSONSchema(extractionSchema);

export type LlmExtraction = z.infer<typeof extractionSchema>;

export function stripHtmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** Strips ```json ... ``` fences some models add even with JSON mode on. */
function stripCodeFence(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return (fenced ? fenced[1] : text).trim();
}

/**
 * Uses Gemini to read the fetched page's visible text and pull out
 * structured listing fields — replaces brittle keyword/regex guessing with
 * actual reading comprehension. Returns null (never throws) when no API key
 * is configured or the call fails, so callers can fall back to the
 * mechanical JSON-LD/OG extraction.
 */
export async function extractWithLlm(html: string, pageUrl: string): Promise<LlmExtraction | null> {
  if (!process.env.GEMINI_API_KEY) return null;

  const text = stripHtmlToText(html).slice(0, MAX_INPUT_CHARS);
  if (!text) return null;

  const establishmentList = ALL_ESTABLISHMENTS.map((e) => `${e.id}: ${e.name}`).join("\n");

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `Extract structured listing data for a student deals/events board from this web page's text.

Page URL: ${pageUrl}
Current date: ${new Date().toISOString()} (use this to resolve relative dates like "this Friday" or a bare "March 5" into concrete ISO 8601 datetimes, assuming Eastern Time / America/Toronto if the page doesn't state a timezone)

Known establishments — set establishment_id only if the host clearly matches one of these; otherwise leave it null and just put the real host/organizer name in establishment_name:
${establishmentList}

Tags — aim for around 5 total. Start with any of these that apply: ${INITIAL_TAGS.join(", ")}. Include "Online" if the listing is fully virtual/remote with no physical venue. If those don't add up to ~5, add a few more short, specific keyword tags describing the listing's topic or interest area (e.g. "Music", "Networking", "Workshop", "Résumé", "Startups") — but only ones that genuinely fit; don't pad the list.

Title: don't just copy the page's raw <title> or headline verbatim if it's cluttered (site-name suffixes, clickbait, ALL CAPS) — write a clear, concise title that accurately describes what the listing is.

Description: if there's no dedicated description/summary section, write one yourself from whatever's on the page — details about what happens, who it's for, what's included, etc. Only leave it null if the page truly has nothing usable.

Location: if this is an online-only event or a deal with no physical venue (webinar, livestream, online promo code, etc.), leave location null and use the "Online" tag instead — never write "Online" or "Virtual" as the location text itself.

Dates: for events, starts_at/ends_at should be the actual start/end of the event (for multi-day events, the first day's start and last day's end). Only fill ends_at if an end is genuinely stated — don't invent one for a single-day event. For deals, starts_at is always null and ends_at is the deadline/expiration if one is stated.

Page text:
"""
${text}
"""

For location, dates, and establishment: if a field genuinely isn't present, return null rather than guessing — don't invent facts. Title and description are the exception: synthesize them from context rather than leaving them null, as instructed above.`,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema,
      },
    });

    const raw = response.text;
    if (!raw) return null;

    const parsed = extractionSchema.safeParse(JSON.parse(stripCodeFence(raw)));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
