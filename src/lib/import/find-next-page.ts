import "server-only";

/**
 * Finds a paginated directory page's "next page" link — the standard
 * rel="next" relation (either a <link> in <head> or an <a> in the body's
 * pagination controls), which is how most CMSs and pagination components
 * mark it. Deliberately narrow: this follows one well-defined "next page of
 * the same list" relation, not arbitrary links, so scanning a paginated
 * directory stays bounded rather than turning into a crawler.
 */
export function findNextPageUrl(html: string, pageUrl: string): string | null {
  const patterns = [
    /<link[^>]+rel=["']next["'][^>]*href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]*rel=["']next["']/i,
    /<a[^>]+rel=["']next["'][^>]*href=["']([^"']+)["']/i,
    /<a[^>]+href=["']([^"']+)["'][^>]*rel=["']next["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match) continue;
    try {
      const url = new URL(match[1], pageUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") continue;
      return url.toString();
    } catch {
      continue;
    }
  }

  return null;
}
