import { HomeShell } from "@/components/site/home-shell";
import { INITIAL_TAGS } from "@/features/listings/constants";
import { getAllTags, getHeroListings, getListingsForTag } from "@/features/listings/queries";

export default async function HomePage() {
  const dbTags = await getAllTags();
  const tags = [...new Set([...INITIAL_TAGS, ...dbTags])];

  const [hero, tagRows] = await Promise.all([
    getHeroListings(),
    Promise.all(
      INITIAL_TAGS.map(async (tag) => ({
        tag,
        listings: await getListingsForTag(tag),
      })),
    ),
  ]);

  return <HomeShell hero={hero} tags={tags} tagRows={tagRows} />;
}
