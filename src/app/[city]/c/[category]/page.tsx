import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ListingGridCard } from "@/components/ListingGridCard";
import { LoopingCategoryIcon } from "@/components/LoopingCategoryIcon";
import { CategoryFilterBar } from "@/components/CategoryFilterBar";
import { EmptyResults } from "@/components/EmptyResults";
import { isValidPin } from "@/lib/pin";
import { isOpenNow } from "@/lib/hours";
import type { WeekHours } from "@/lib/types";

type Params = { city: string; category: string };
type SP = { verified?: string; photo?: string; open?: string };

export const dynamic = "force-dynamic";

async function loadContext(params: Params) {
  const supabase = await createSupabaseServerClient();
  const [{ data: city }, { data: category }] = await Promise.all([
    supabase.from("cities").select("id, name, slug").eq("slug", params.city).maybeSingle(),
    supabase.from("categories").select("id, name, slug, icon").eq("slug", params.category).maybeSingle(),
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
    title: `${(category as { name: string }).name} in ${(city as { name: string }).name}`,
  };
}

export default async function CategoryPage(
  {
    params,
    searchParams,
  }: { params: Promise<Params>; searchParams: Promise<SP> },
) {
  const [p, sp] = await Promise.all([params, searchParams]);
  const { supabase, city, category } = await loadContext(p);
  if (!city || !category) notFound();

  const pin = (await cookies()).get("pin")?.value ?? "";
  const pinFilter = isValidPin(pin) ? pin : null;
  const verifiedOnly = sp.verified === "1";
  const photoOnly = sp.photo === "1";
  const openOnly = sp.open === "1";

  let q = supabase
    .from("listings")
    .select(
      `id, name, slug, description, verified, pin_code, photo_url, hours_json,
       neighborhoods!inner ( name, slug, city_id ),
       categories!inner ( name, slug )`,
    )
    .eq("status", "approved")
    .eq("category_id", (category as { id: string }).id)
    .eq("neighborhoods.city_id", (city as { id: string }).id);
  if (pinFilter) q = q.eq("pin_code", pinFilter);
  if (verifiedOnly) q = q.eq("verified", true);
  const { data: listings } = await q.order("name");

  type Row = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    verified: boolean;
    pin_code: string | null;
    photo_url: string | null;
    hours_json: WeekHours | null;
    neighborhoods: { name: string; slug: string };
  };
  let rows = (listings ?? []) as unknown as Row[];
  if (photoOnly) rows = rows.filter((r) => !!r.photo_url);
  if (openOnly) rows = rows.filter((r) => isOpenNow(r.hours_json) === true);

  const filtersActive = pinFilter || verifiedOnly || photoOnly || openOnly;
  let suggestions: { name: string; slug: string }[] = [];
  if (rows.length === 0) {
    const { data: cats } = await supabase
      .from("categories")
      .select("name, slug")
      .neq("id", (category as { id: string }).id)
      .order("name")
      .limit(3);
    suggestions = (cats ?? []) as { name: string; slug: string }[];
  }

  const citySlug = (city as { slug: string }).slug;
  const cityName = (city as { name: string }).name;
  const categoryName = (category as { name: string }).name;

  return (
    <Container className="py-7 space-y-6">
      <header className="flex items-center gap-3">
        <span className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <LoopingCategoryIcon
            slug={(category as { slug: string }).slug}
            icon={(category as { icon: string | null }).icon}
            size={26}
          />
        </span>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight font-heading">
            {categoryName}
          </h1>
          {pinFilter ? (
            <Badge className="bg-primary/10 text-primary border-primary/20 font-mono">
              {pinFilter}
            </Badge>
          ) : null}
        </div>
      </header>

      <p className="flex items-center gap-1 text-xs text-muted-foreground -mt-4">
        <span>{cityName}</span>
        <ChevronRight className="size-3" />
        <span className="text-foreground font-medium">{categoryName}</span>
      </p>

      <CategoryFilterBar />

      {rows.length === 0 ? (
        <EmptyResults
          heading={
            filtersActive
              ? `No ${categoryName.toLowerCase()} listings match these filters.`
              : `No ${categoryName.toLowerCase()} listings yet in ${cityName}.`
          }
          suggestions={suggestions.map((c) => ({
            name: c.name,
            href: `/${citySlug}/c/${c.slug}`,
          }))}
        />
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((l) => (
            <ListingGridCard
              key={l.id}
              id={l.id}
              href={`/${citySlug}/${l.neighborhoods.slug}/${(category as { slug: string }).slug}/${l.slug}`}
              name={l.name}
              categorySlug={(category as { slug: string }).slug}
              categoryIcon={(category as { icon: string | null }).icon}
              subtitle={l.neighborhoods.name}
              description={l.description}
              verified={l.verified}
              pin={l.pin_code}
              photo_url={l.photo_url}
              hours={l.hours_json}
            />
          ))}
        </div>
      )}
    </Container>
  );
}
