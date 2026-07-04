export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatListingDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function isListingExpired(endsAt: string | null): boolean {
  if (!endsAt) return false;
  return new Date(endsAt).getTime() <= Date.now();
}

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

/**
 * Compact badge summarizing urgency, e.g. "In 3d", "Happening now",
 * "2w left", "Ends today". For deals with no deadline (ends_at null),
 * returns "All year" (ongoing).
 */
export function getTimeBadge(listing: {
  starts_at: string | null;
  ends_at: string | null;
}): string {
  const now = Date.now();

  if (listing.starts_at) {
    const startsAt = new Date(listing.starts_at).getTime();
    if (startsAt > now) {
      const diffH = (startsAt - now) / HOUR_MS;
      if (diffH < 1) return "Starting soon";
      if (diffH < 24) return `In ${Math.round(diffH)}h`;
      const diffD = diffH / 24;
      if (diffD < 7) return `In ${Math.round(diffD)}d`;
      return new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric" }).format(
        startsAt,
      );
    }
    const endsAt = listing.ends_at ? new Date(listing.ends_at).getTime() : null;
    if (!endsAt || endsAt > now) return "Happening now";
  }

  if (listing.ends_at) {
    const diffMs = new Date(listing.ends_at).getTime() - now;
    if (diffMs <= 0) return "Expired";
    const diffD = diffMs / DAY_MS;
    if (diffD < 1) return "Ends today";
    if (diffD < 14) return `${Math.round(diffD)}d left`;
    if (diffD < 60) return `${Math.round(diffD / 7)}w left`;
    return `${Math.round(diffD / 30)}mo left`;
  }

  return "All year";
}
