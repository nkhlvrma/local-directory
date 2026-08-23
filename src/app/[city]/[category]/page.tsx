import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/ListingCard";

type Params = { city: string; category: string };

export const revalidate = 300;

async function loadContext(params: Params) {
  const supabase = await createSupabaseServerClient();
  const [{ data: city }, { data: category }] = await Promise.all([
    supabase.from("cities").select("id, name, slug").eq("slug", params.city).maybeSingle(),
    supabase.from("categories").select("id, name, slug").eq("slug", params.category).maybeSingle(),
  ]);
  return { supabase, city, category };
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const p = await params;
  const { city, category } = await loadContext(p);
  if (!city || !category) return {};
  return {
    title: `${category.name} in ${city.name}`,
    description: `Verified ${category.name.toLowerCase()} in ${city.name}. Chat on WhatsApp directly.`,
  };
}

export default async function CategoryPage(
  { params }: { params: Promise<Params> },
) {
  const p = await params;
  const { supabase, city, category } = await loadContext(p);
  if (!city || !category) notFound();

  const { data: listings } = await supabase
    .from("listings")
    .select(
      `id, name, slug, description, verified,
       neighborhoods!inner ( name, slug, city_id ),
       categories!inner ( name, slug )`,
    )
    .eq("status", "approved")
    .eq("category_id", category.id)
    .eq("neighborhoods.city_id", city.id)
    .order("name");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <header>
        <p className="text-sm text-black/50 dark:text-white/50">{city.name}</p>
        <h1 className="mt-1 text-2xl font-semibold">{category.name}</h1>
      </header>

      {(listings ?? []).length === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">
          No listings yet in this category.
        </p>
      ) : (
        <div className="grid gap-3">
          {((listings ?? []) as Array<{ id: string; name: string; slug: string; description: string | null; verified: boolean; neighborhoods: { name: string; slug: string } }>).map((l) => {
            const n = l.neighborhoods;
            return (
              <ListingCard
                key={l.id}
                href={`/${city.slug}/${n.slug}/${category.slug}/${l.slug}`}
                name={l.name}
                neighborhood={n.name}
                description={l.description}
                verified={l.verified}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
