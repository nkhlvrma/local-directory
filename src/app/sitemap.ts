import type { MetadataRoute } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SITE_URL, CITY_SLUG } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createSupabaseServerClient();
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
  ];

  const { data: city } = await supabase
    .from("cities")
    .select("id, slug")
    .eq("slug", CITY_SLUG)
    .maybeSingle();
  if (!city) return entries;

  const [{ data: categories }, { data: neighborhoods }, { data: listings }] =
    await Promise.all([
      supabase.from("categories").select("slug"),
      supabase.from("neighborhoods").select("slug").eq("city_id", city.id),
      supabase
        .from("listings")
        .select(
          `slug,
           neighborhoods!inner ( slug, city_id ),
           categories!inner ( slug )`,
        )
        .eq("status", "approved")
        .eq("neighborhoods.city_id", city.id),
    ]);

  for (const c of categories ?? [])
    entries.push({ url: `${SITE_URL}/${city.slug}/c/${c.slug}` });
  for (const n of neighborhoods ?? [])
    entries.push({ url: `${SITE_URL}/${city.slug}/n/${n.slug}` });
  for (const l of listings ?? []) {
    const row = l as unknown as {
      slug: string;
      neighborhoods: { slug: string };
      categories: { slug: string };
    };
    entries.push({
      url: `${SITE_URL}/${city.slug}/${row.neighborhoods.slug}/${row.categories.slug}/${row.slug}`,
    });
  }
  return entries;
}
