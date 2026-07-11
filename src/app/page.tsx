import { HomeShell } from "@/components/site/home-shell";
import { BROWSE_FILTER_TAGS, INITIAL_TAGS } from "@/features/listings/constants";
import { getHeroListings, getListingsForTag } from "@/features/listings/queries";

// Fetches live listings on every request — publishing/editing in the admin
// should show up immediately without waiting on a redeploy. Also avoids
// Next.js prerendering this page at build time, when Supabase env vars
// aren't necessarily available yet.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [hero, tagRows] = await Promise.all([
    getHeroListings(),
    Promise.all(
      INITIAL_TAGS.map(async (tag) => ({
        tag,
        listings: await getListingsForTag(tag),
      })),
    ),
  ]);

  return <HomeShell hero={hero} tags={BROWSE_FILTER_TAGS} tagRows={tagRows} />;
}
