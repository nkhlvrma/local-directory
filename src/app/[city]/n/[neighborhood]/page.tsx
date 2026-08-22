import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/ListingCard";

type Params = { city: string; neighborhood: string };

export const revalidate = 300;

async function loadContext(params: Params) {
  const supabase = await createSupabaseServerClient();
  const { data: city } = await supabase
    .from("cities")
    .select("id, name, slug")
    .eq("slug", params.city)
    .maybeSingle();
  if (!city) return { supabase, city: null, neighborhood: null };
  const { data: neighborhood } = await supabase
    .from("neighborhoods")
    .select("id, name, slug, city_id")
    .eq("city_id", city.id)
    .eq("slug", params.neighborhood)
    .maybeSingle();
  return { supabase, city, neighborhood };
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const p = await params;
  const { city, neighborhood } = await loadContext(p);
  if (!city || !neighborhood) return {};
  return {
    title: `${neighborhood.name}, ${city.name}`,
    description: `Verified local businesses in ${neighborhood.name}, ${city.name}.`,
  };
}

export default async function NeighborhoodPage(
  { params }: { params: Promise<Params> },
) {
  const p = await params;
  const { supabase, city, neighborhood } = await loadContext(p);
  if (!city || !neighborhood) notFound();

  const { data: listings } = await supabase
    .from("listings")
    .select(
      `id, name, slug, description,
       categories!inner ( name, slug )`,
    )
    .eq("status", "approved")
    .eq("neighborhood_id", neighborhood.id)
    .order("name");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <header>
        <p className="text-sm text-black/50 dark:text-white/50">{city.name}</p>
        <h1 className="mt-1 text-2xl font-semibold">{neighborhood.name}</h1>
      </header>

      {(listings ?? []).length === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">
          No listings yet in this neighborhood.
        </p>
      ) : (
        <div className="grid gap-3">
          {((listings ?? []) as Array<{ id: string; name: string; slug: string; description: string | null; categories: { name: string; slug: string } }>).map((l) => {
            const c = l.categories;
            return (
              <ListingCard
                key={l.id}
                href={`/${city.slug}/${neighborhood.slug}/${c.slug}/${l.slug}`}
                name={l.name}
                category={c.name}
                description={l.description}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
