import { cookies } from "next/headers";
import type { Metadata } from "next";
import { Container, Heading, Text, Flex, Grid, Badge } from "@radix-ui/themes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CITY_SLUG, SITE_NAME_FALLBACK } from "@/lib/site";
import { ListingCard } from "@/components/ListingCard";
import { SearchBar } from "@/components/SearchBar";
import { isValidPin } from "@/lib/pin";

export const dynamic = "force-dynamic";

type SP = { q?: string };

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<SP> },
): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q}` : "Search",
    robots: { index: false },
  };
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
    neighborhoods: { name: string; slug: string; city_id: string };
    categories: { name: string; slug: string };
  };
  let rows: Row[] = [];

  if (city && query) {
    // Match against name and description. Escape % and _ so the query is
    // treated as literal text, not a wildcard by the user.
    const safe = query.replace(/[\\%_]/g, "\\$&");
    const like = `%${safe}%`;

    let q2 = supabase
      .from("listings")
      .select(
        `id, name, slug, description, verified, pin_code,
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
  }

  return (
    <Container size="3" px="4" py="6">
      <Flex direction="column" gap="4">
        <Heading size="6">
          {query ? (
            <>
              Results for <span style={{ color: "var(--grass-11)" }}>{query}</span>
            </>
          ) : (
            "Search"
          )}
        </Heading>

        <SearchBar size="2" initialQuery={query} autoFocus={!query} />

        {pinFilter ? (
          <Text size="1" color="gray">
            <Badge color="grass" size="1" mr="1">PIN {pinFilter}</Badge>
            filtering to your area
          </Text>
        ) : null}

        {!query ? (
          <Text size="2" color="gray">
            Try a business name, category, or keyword.
          </Text>
        ) : rows.length === 0 ? (
          <Text size="2" color="gray">
            No matches in {(city as { name: string } | null)?.name ?? SITE_NAME_FALLBACK}.
          </Text>
        ) : (
          <Grid columns="1" gap="3">
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
              />
            ))}
          </Grid>
        )}
      </Flex>
    </Container>
  );
}
