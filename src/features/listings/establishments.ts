export type EstablishmentIconSource =
  | { kind: "school"; src: string }
  | { kind: "brand"; slug: string };

export type Establishment = {
  id: string;
  name: string;
  icon: EstablishmentIconSource;
};

// Local school crests — files already added to public/schools/.
export const SCHOOL_ESTABLISHMENTS: Establishment[] = [
  {
    id: "carleton",
    name: "Carleton University",
    icon: { kind: "school", src: "/schools/carleton-ravens-logo-png_seeklogo-496040.png" },
  },
  {
    id: "uottawa",
    name: "University of Ottawa",
    icon: { kind: "school", src: "/schools/splash-geegees-logo_UOTTAWA.png" },
  },
  {
    id: "algonquin",
    name: "Algonquin College",
    icon: { kind: "school", src: "/schools/208-2081804_algonquin-college-icon-algonquin-college-logo-hd-png.png" },
  },
];

// Curated brand slugs, verified present in the installed simple-icons
// package. Rendered via /api/establishment-icon (resolves the colored SVG
// server-side so simple-icons is never bundled to the client). Add more
// entries here as needed — just confirm the slug exists in simple-icons first.
export const BRAND_ESTABLISHMENTS: Establishment[] = [
  { id: "starbucks", name: "Starbucks", icon: { kind: "brand", slug: "starbucks" } },
  { id: "mcdonalds", name: "McDonald's", icon: { kind: "brand", slug: "mcdonalds" } },
  { id: "kfc", name: "KFC", icon: { kind: "brand", slug: "kfc" } },
  { id: "doordash", name: "DoorDash", icon: { kind: "brand", slug: "doordash" } },
  { id: "ubereats", name: "Uber Eats", icon: { kind: "brand", slug: "ubereats" } },
  { id: "airbnb", name: "Airbnb", icon: { kind: "brand", slug: "airbnb" } },
  { id: "shopify", name: "Shopify", icon: { kind: "brand", slug: "shopify" } },
  { id: "instagram", name: "Instagram", icon: { kind: "brand", slug: "instagram" } },
  { id: "facebook", name: "Facebook", icon: { kind: "brand", slug: "facebook" } },
  { id: "x", name: "X (Twitter)", icon: { kind: "brand", slug: "x" } },
  { id: "snapchat", name: "Snapchat", icon: { kind: "brand", slug: "snapchat" } },
  { id: "discord", name: "Discord", icon: { kind: "brand", slug: "discord" } },
  { id: "spotify", name: "Spotify", icon: { kind: "brand", slug: "spotify" } },
  { id: "tiktok", name: "TikTok", icon: { kind: "brand", slug: "tiktok" } },
  { id: "youtube", name: "YouTube", icon: { kind: "brand", slug: "youtube" } },
  { id: "twitch", name: "Twitch", icon: { kind: "brand", slug: "twitch" } },
  { id: "netflix", name: "Netflix", icon: { kind: "brand", slug: "netflix" } },
];

export const ALL_ESTABLISHMENTS: Establishment[] = [
  ...SCHOOL_ESTABLISHMENTS,
  ...BRAND_ESTABLISHMENTS,
];

export function getEstablishment(id: string | null | undefined): Establishment | undefined {
  if (!id) return undefined;
  return ALL_ESTABLISHMENTS.find((e) => e.id === id);
}

export function establishmentIconUrl(icon: EstablishmentIconSource): string {
  return icon.kind === "school" ? icon.src : `/api/establishment-icon?id=${icon.slug}`;
}
