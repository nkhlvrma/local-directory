import { cookies } from "next/headers";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CITY_SLUG, SITE_NAME_FALLBACK } from "@/lib/site";
import { ListingGridCard } from "@/components/ListingGridCard";
import { SearchBar } from "@/components/SearchBar";
import { EmptyResults } from "@/components/EmptyResults";
import { isValidPin } from "@/lib/pin";
import { isMockMode } from "@/lib/supabase/mock";
import { logEvent } from "@/lib/analytics";
import type { WeekHours } from "@/lib/types";

export const dynamic = "force-dynamic";

type SP = { q?: string };

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<SP> },
): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Search: ${q}` : "Search", robots: { index: false } };
}

export default async function SearchPage(
  { searchParams }: { searchParams: Promise<SP> },
) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const supabase = await createSupabaseServerClient();
  const pin = (await cookies()).get("pin")?.value ?? "";
  const pinFilter = isValidPin(pin) ? pin : null;

  const { data: city } = await supabase
    .from("cities")
    .select("id, name, slug")
    .eq("slug", CITY_SLUG)
    .maybeSingle();

  type Row = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    verified: boolean;
    pin_code: string | null;
    photo_url: string | null;
    hours_json: WeekHours | null;
    neighborhoods: { name: string; slug: string; city_id: string };
    categories: { name: string; slug: string; icon: string | null };
  };
  let rows: Row[] = [];

  if (city && query) {
    const safe = query.replace(/[\\%_]/g, "\\$&");
    const like = `%${safe}%`;
    let q2 = supabase
      .from("listings")
      .select(
        `id, name, slug, description, verified, pin_code, photo_url, hours_json,
         neighborhoods!inner ( name, slug, city_id ),
         categories!inner ( name, slug, icon )`,
      )
      .eq("status", "approved")
      .eq("neighborhoods.city_id", (city as { id: string }).id)
      .or(`name.ilike.${like},description.ilike.${like}`)
      .limit(50);
    if (pinFilter) q2 = q2.eq("pin_code", pinFilter);
    const { data } = await q2;
    rows = (data ?? []) as unknown as Row[];

    if (!isMockMode()) {
      const adminC = createSupabaseAdminClient();
      await adminC.from("search_events").insert({
        query,
        matched_count: rows.length,
        city_slug: CITY_SLUG,
        pin_code: pinFilter,
      });
    }

    // General funnel event (separate from the zero-result-only search_events
    // table above), fire-and-forget, works in mock mode too.
    await logEvent("search_submitted", {
      metadata: { query, matched_count: rows.length, city_slug: CITY_SLUG },
    });
  }

  let suggestions: { name: string; slug: string }[] = [];
  if (query && rows.length === 0) {
    const { data: cats } = await supabase
      .from("categories")
      .select("name, slug")
      .order("name")
      .limit(3);
    suggestions = (cats ?? []) as { name: string; slug: string }[];
  }

  return (
    <Container className="py-7 space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight mb-4 font-heading">
          {query ? (
            <>
              Results for{" "}
              <span className="text-primary">&ldquo;{query}&rdquo;</span>
            </>
          ) : (
            "Search"
          )}
        </h1>
        <SearchBar size="md" initialQuery={query} autoFocus={!query} />
      </header>

      {query ? (
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{(city as { name: string } | null)?.name ?? SITE_NAME_FALLBACK}</span>
          <ChevronRight className="size-3" />
          <span className="text-foreground font-medium">&ldquo;{query}&rdquo;</span>
        </p>
      ) : null}

      {pinFilter ? (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Badge className="bg-primary/10 text-primary border-primary/20 font-mono">
            {pinFilter}
          </Badge>
          <span>filtering to your area</span>
        </div>
      ) : null}

      {!query ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Try a business name, category, or keyword.
        </p>
      ) : rows.length === 0 ? (
        <EmptyResults
          heading={`No matches for "${query}" in ${(city as { name: string } | null)?.name ?? SITE_NAME_FALLBACK}.`}
          suggestions={suggestions.map((c) => ({
            name: c.name,
            href: `/${CITY_SLUG}/c/${c.slug}`,
          }))}
        />
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {rows.length} result{rows.length !== 1 ? "s" : ""}
          </p>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {rows.map((l) => (
              <ListingGridCard
                key={l.id}
                id={l.id}
                href={`/${CITY_SLUG}/${l.neighborhoods.slug}/${l.categories.slug}/${l.slug}`}
                name={l.name}
                categorySlug={l.categories.slug}
                categoryIcon={l.categories.icon}
                subtitle={`${l.categories.name} · ${l.neighborhoods.name}`}
                description={l.description}
                verified={l.verified}
                pin={l.pin_code}
                photo_url={l.photo_url}
                hours={l.hours_json}
              />
            ))}
          </div>
        </>
      )}
    </Container>
  );
}
