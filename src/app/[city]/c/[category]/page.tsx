import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { createSupabaseStaticClient, unwrap } from "@/lib/supabase/server";
import { LoopingCategoryIcon } from "@/components/LoopingCategoryIcon";
import { CategoryFilterBar } from "@/components/CategoryFilterBar";
import { ActivePinBadge } from "@/components/ActivePinBadge";
import {
  FilteredListingGrid,
  type GridItem,
} from "@/components/FilteredListingGrid";
import { LISTING_CARD_COLUMNS, type ListingCardRow } from "@/lib/types";

type Params = { city: string; category: string };

// Cached, not dynamic: this is a page that has to rank. Filtering (including
// the PIN cookie) moved to the client so the HTML can be prerendered — see
// lib/listing-filters. `dynamicParams` stays on by default, so a category
// added after the last build still renders on demand.
// Admin actions purge these pages on every change (revalidateListing), so
// this is only a backstop for anything that changes outside the admin UI.
export const revalidate = 3600;

export async function generateStaticParams(): Promise<Params[]> {
  const supabase = createSupabaseStaticClient();
  const [citiesRes, categoriesRes] = await Promise.all([
    supabase.from("cities").select("slug").eq("active", true),
    supabase.from("categories").select("slug"),
  ]);
  const cities = unwrap(citiesRes);
  const categories = unwrap(categoriesRes);
  const out: Params[] = [];
  for (const c of (cities ?? []) as { slug: string }[])
    for (const cat of (categories ?? []) as { slug: string }[])
      out.push({ city: c.slug, category: cat.slug });
  return out;
}

async function loadContext(params: Params) {
  const supabase = createSupabaseStaticClient();
  const [cityRes, categoryRes] = await Promise.all([
    supabase.from("cities").select("id, name, slug").eq("slug", params.city).maybeSingle(),
    supabase.from("categories").select("id, name, slug, icon").eq("slug", params.category).maybeSingle(),
  ]);
  return { supabase, city: unwrap(cityRes), category: unwrap(categoryRes) };
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const p = await params;
  const { city, category } = await loadContext(p);
  if (!city || !category) return {};
  return {
    title: `${(category as { name: string }).name} in ${(city as { name: string }).name}`,
  };
}

export default async function CategoryPage(
  { params }: { params: Promise<Params> },
) {
  const p = await params;
  const { supabase, city, category } = await loadContext(p);
  if (!city || !category) notFound();

  const categoryId = (category as { id: string }).id;
  const categorySlug = (category as { slug: string }).slug;
  const categoryIcon = (category as { icon: string | null }).icon;
  const citySlug = (city as { slug: string }).slug;
  const cityName = (city as { name: string }).name;
  const categoryName = (category as { name: string }).name;

  // Fetch the whole approved set for this category — filters narrow it in the
  // browser. Bounded by a category within one city, so this stays small.
  const listings = unwrap(
    await supabase
      .from("listings")
      .select(
        `${LISTING_CARD_COLUMNS},
         neighborhoods!inner ( name, slug, city_id ),
         categories!inner ( name, slug )`,
      )
      .eq("status", "approved")
      .eq("category_id", categoryId)
      .eq("neighborhoods.city_id", (city as { id: string }).id)
      .order("name"),
  );

  type Row = ListingCardRow & { neighborhoods: { name: string; slug: string } };
  const rows = (listings ?? []) as unknown as Row[];

  const items: GridItem[] = rows.map((l) => ({
    ...l,
    href: `/${citySlug}/${l.neighborhoods.slug}/${categorySlug}/${l.slug}`,
    categorySlug,
    categoryIcon,
    subtitle: l.neighborhoods.name,
  }));

  const { data: cats } = await supabase
    .from("categories")
    .select("name, slug")
    .neq("id", categoryId)
    .order("name")
    .limit(3);
  const suggestions = ((cats ?? []) as { name: string; slug: string }[]).map(
    (c) => ({ name: c.name, href: `/${citySlug}/c/${c.slug}` }),
  );

  return (
    <Container className="py-7 space-y-6">
      <header className="flex items-center gap-3">
        <span className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <LoopingCategoryIcon
            slug={categorySlug}
            icon={categoryIcon}
            size={26}
          />
        </span>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight font-heading">
            {categoryName}
          </h1>
          <ActivePinBadge />
        </div>
      </header>

      <p className="flex items-center gap-1 text-xs text-muted-foreground -mt-4">
        <span>{cityName}</span>
        <ChevronRight className="size-3" />
        <span className="text-foreground font-medium">{categoryName}</span>
      </p>

      <CategoryFilterBar />

      <FilteredListingGrid
        items={items}
        emptyHeading={`No ${categoryName.toLowerCase()} listings yet in ${cityName}.`}
        filteredHeading={`No ${categoryName.toLowerCase()} listings match these filters.`}
        suggestions={suggestions}
      />
    </Container>
  );
}
