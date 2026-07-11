import "server-only";
import { assertSafeUrl, UnsafeUrlError } from "./security";

const FETCH_TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 5;
const MAX_HTML_BYTES = 2 * 1024 * 1024; // 2MB — plenty for a page's <head> + markup.
const USER_AGENT = "FreePlugImporterBot/1.0 (+https://freeplug.app)";

export class FetchPageError extends Error {}

export type FetchedPage = {
  html: string;
  finalUrl: string;
};

/**
 * Fetches a single page server-side for the link importer. Never forwards
 * the admin's cookies (a fresh server-side fetch has none to forward),
 * follows redirects manually so each hop can be re-validated against the
 * SSRF guardrails, caps how much body we read, and times out.
 */
export async function fetchPage(rawUrl: string): Promise<FetchedPage> {
  let currentUrl = rawUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const url = await assertSafeUrl(currentUrl);

    const response = await fetch(url, {
      method: "GET",
      redirect: "manual",
      credentials: "omit",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
    }).catch((err) => {
      throw new FetchPageError(
        err?.name === "TimeoutError" ? "The page took too long to respond." : "Could not reach that URL.",
      );
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        throw new FetchPageError("The page redirected without a destination.");
      }
      currentUrl = new URL(location, url).toString();
      continue;
    }

    if (!response.ok) {
      throw new FetchPageError(`The page responded with status ${response.status}.`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("html")) {
      throw new FetchPageError("That URL doesn't look like a web page.");
    }

    const html = await readBodyCapped(response, MAX_HTML_BYTES);
    return { html, finalUrl: url.toString() };
  }

  throw new FetchPageError("Too many redirects.");
}

async function readBodyCapped(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) return "";

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > maxBytes) {
      await reader.cancel().catch(() => {});
      chunks.push(value.subarray(0, value.byteLength - (received - maxBytes)));
      break;
    }
    chunks.push(value);
  }

  const combined = new Uint8Array(chunks.reduce((sum, c) => sum + c.byteLength, 0));
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder("utf-8").decode(combined);
}

export function isFetchPageError(err: unknown): err is FetchPageError | UnsafeUrlError {
  return err instanceof FetchPageError || err instanceof UnsafeUrlError;
}
