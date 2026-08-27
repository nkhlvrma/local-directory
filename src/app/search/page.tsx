import { cookies } from "next/headers";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CITY_SLUG, SITE_NAME_FALLBACK } from "@/lib/site";
import { ListingCard } from "@/components/ListingCard";
import { SearchBar } from "@/components/SearchBar";
import { isValidPin } from "@/lib/pin";
import { isMockMode } from "@/lib/supabase/mock";
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
    categories: { name: string; slug: string };
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
         categories!inner ( name, slug )`,
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
  }

  return (
    <Container className="py-6 space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">
        {query ? (
          <>
            Results for <span className="text-green-700 dark:text-green-400">{query}</span>
          </>
        ) : (
          "Search"
        )}
      </h1>

      <SearchBar size="md" initialQuery={query} autoFocus={!query} />

      {pinFilter ? (
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Badge className="bg-green-100 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-200">
            PIN {pinFilter}
          </Badge>
          filtering to your area
        </div>
      ) : null}

      {!query ? (
        <p className="text-sm text-muted-foreground">
          Try a business name, category, or keyword.
        </p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No matches in {(city as { name: string } | null)?.name ?? SITE_NAME_FALLBACK}.
        </p>
      ) : (
        <div className="grid gap-3">
          {rows.map((l) => (
            <ListingCard
              key={l.id}
              href={`/${CITY_SLUG}/${l.neighborhoods.slug}/${l.categories.slug}/${l.slug}`}
              name={l.name}
              category={l.categories.name}
              neighborhood={l.neighborhoods.name}
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
