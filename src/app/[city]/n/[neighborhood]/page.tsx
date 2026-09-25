import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { createSupabaseStaticClient, unwrap } from "@/lib/supabase/server";
import { CategoryFilterBar } from "@/components/CategoryFilterBar";
import {
  FilteredListingGrid,
  type GridItem,
} from "@/components/FilteredListingGrid";
import { LISTING_CARD_COLUMNS, type ListingCardRow } from "@/lib/types";

type Params = { city: string; neighborhood: string };

// See the category page: cached rather than dynamic, with filtering moved to
// the client so the prerendered HTML survives.
// Admin actions purge these pages on every change (revalidateListing), so
// this is only a backstop for anything that changes outside the admin UI.
export const revalidate = 3600;

export async function generateStaticParams(): Promise<Params[]> {
  const supabase = createSupabaseStaticClient();
  const cities = unwrap(
    await supabase.from("cities").select("id, slug").eq("active", true),
  );
  const out: Params[] = [];
  for (const c of (cities ?? []) as { id: string; slug: string }[]) {
    const hoods = unwrap(
      await supabase.from("neighborhoods").select("slug").eq("city_id", c.id),
    );
    for (const n of (hoods ?? []) as { slug: string }[])
      out.push({ city: c.slug, neighborhood: n.slug });
  }
  return out;
}

async function loadContext(params: Params) {
  const supabase = createSupabaseStaticClient();
  const city = unwrap(
    await supabase
      .from("cities")
      .select("id, name, slug")
      .eq("slug", params.city)
      .maybeSingle(),
  );
  if (!city) return { supabase, city: null, neighborhood: null };
  const neighborhood = unwrap(
    await supabase
      .from("neighborhoods")
      .select("id, name, slug, city_id")
      .eq("city_id", (city as { id: string }).id)
      .eq("slug", params.neighborhood)
      .maybeSingle(),
  );
  return { supabase, city, neighborhood };
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const p = await params;
  const { city, neighborhood } = await loadContext(p);
  if (!city || !neighborhood) return {};
  return {
    title: `${(neighborhood as { name: string }).name}, ${(city as { name: string }).name}`,
  };
}

export default async function NeighborhoodPage(
  { params }: { params: Promise<Params> },
) {
  const p = await params;
  const { supabase, city, neighborhood } = await loadContext(p);
  if (!city || !neighborhood) notFound();

  const citySlug = (city as { slug: string }).slug;
  const cityName = (city as { name: string }).name;
  const hoodSlug = (neighborhood as { slug: string }).slug;
  const neighborhoodName = (neighborhood as { name: string }).name;

  const listings = unwrap(
    await supabase
      .from("listings")
      .select(
        `${LISTING_CARD_COLUMNS},
         categories!inner ( name, slug, icon )`,
      )
      .eq("status", "approved")
      .eq("neighborhood_id", (neighborhood as { id: string }).id)
      .order("name"),
  );

  type Row = ListingCardRow & {
    categories: { name: string; slug: string; icon: string | null };
  };
  const rows = (listings ?? []) as unknown as Row[];

  const items: GridItem[] = rows.map((l) => ({
    ...l,
    href: `/${citySlug}/${hoodSlug}/${l.categories.slug}/${l.slug}`,
    categorySlug: l.categories.slug,
    categoryIcon: l.categories.icon,
    subtitle: l.categories.name,
  }));

  const { data: cats } = await supabase
    .from("categories")
    .select("name, slug")
    .order("name")
    .limit(3);
  const suggestions = ((cats ?? []) as { name: string; slug: string }[]).map(
    (c) => ({ name: c.name, href: `/${citySlug}/c/${c.slug}` }),
  );

  return (
    <Container className="py-7 space-y-6">
      <header className="flex items-center gap-2.5 flex-wrap">
        <h1 className="text-2xl font-bold tracking-tight font-heading">
          {neighborhoodName}
        </h1>
      </header>

      <p className="flex items-center gap-1 text-xs text-muted-foreground -mt-4">
        <span>{cityName}</span>
        <ChevronRight className="size-3" />
        <span className="text-foreground font-medium">{neighborhoodName}</span>
      </p>

      <CategoryFilterBar />

      <FilteredListingGrid
        items={items}
        emptyHeading={`No listings yet in ${neighborhoodName}.`}
        filteredHeading={`No listings in ${neighborhoodName} match these filters.`}
        suggestions={suggestions}
      />
    </Container>
  );
}
