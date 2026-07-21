import { HomeShell } from "@/components/site/home-shell";
import { BROWSE_FILTER_TAGS } from "@/features/listings/constants";
import { getDealListings, getEventListings, getHeroListings } from "@/features/listings/queries";

// Fetches live listings on every request — publishing/editing in the admin
// should show up immediately without waiting on a redeploy. Also avoids
// Next.js prerendering this page at build time, when Supabase env vars
// aren't necessarily available yet.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [hero, events, deals] = await Promise.all([
    getHeroListings(),
    getEventListings(),
    getDealListings(),
  ]);

  return <HomeShell hero={hero} tags={BROWSE_FILTER_TAGS} events={events} deals={deals} />;
}
