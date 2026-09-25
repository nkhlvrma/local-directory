import { unstable_cache } from "next/cache";
import { createSupabaseStaticClient, unwrap } from "@/lib/supabase/server";
import { CITY_SLUG } from "@/lib/site";
import type { FieldDef } from "@/lib/types";

// The city row and the category/neighborhood lists change a few times a year
// but were re-queried on every request to the dynamic pages (/search, the
// submission sheet). That's a Supabase round-trip in front of every search.
//
// unstable_cache keeps them in the data cache, shared across requests and
// invalidated by tag the moment an admin adds a category or neighborhood
// (see revalidateTag in admin/actions.ts) — so the hour is only a backstop.
//
// These run the cookie-free client on purpose: reading cookies inside a
// cached function isn't allowed, and none of this is per-visitor.

export const TAXONOMY_TAG = "taxonomy";

export type ActiveCity = { id: string; name: string; slug: string };

export const getActiveCity = unstable_cache(
  async (): Promise<ActiveCity | null> =>
    unwrap(
      await createSupabaseStaticClient()
        .from("cities")
        .select("id, name, slug")
        .eq("slug", CITY_SLUG)
        .maybeSingle(),
    ) as ActiveCity | null,
  ["active-city", CITY_SLUG],
  { revalidate: 3600, tags: [TAXONOMY_TAG] },
);

export type SubmissionOptions = {
  city: { id: string; name: string } | null;
  categories: { id: string; name: string; fields_schema: FieldDef[] | null }[];
  neighborhoods: { id: string; name: string }[];
};

// Everything the "list your business" form needs to render its selects.
export const getSubmissionOptions = unstable_cache(
  async (): Promise<SubmissionOptions> => {
    const supabase = createSupabaseStaticClient();
    const city = (await getActiveCity()) as ActiveCity | null;

    const [categories, neighborhoods] = await Promise.all([
      supabase.from("categories").select("id, name, fields_schema").order("name"),
      city
        ? supabase
            .from("neighborhoods")
            .select("id, name")
            .eq("city_id", city.id)
            .order("name")
        : Promise.resolve({ data: [], error: null }),
    ]);

    return {
      city: city ? { id: city.id, name: city.name } : null,
      categories: (unwrap(categories) ?? []) as SubmissionOptions["categories"],
      neighborhoods: (unwrap(neighborhoods) ?? []) as {
        id: string;
        name: string;
      }[],
    };
  },
  ["submission-options-v2", CITY_SLUG],
  { revalidate: 3600, tags: [TAXONOMY_TAG] },
);
