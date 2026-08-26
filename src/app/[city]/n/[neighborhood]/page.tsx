import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { Container, Heading, Text, Flex, Grid, Badge } from "@radix-ui/themes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/ListingCard";
import { CategoryFilterBar } from "@/components/CategoryFilterBar";
import { isValidPin } from "@/lib/pin";
import { isOpenNow } from "@/lib/hours";
import type { WeekHours } from "@/lib/types";

type Params = { city: string; neighborhood: string };
type SP = { verified?: string; photo?: string; open?: string };

export const dynamic = "force-dynamic";

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
    .eq("city_id", (city as { id: string }).id)
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
    title: `${(neighborhood as { name: string }).name}, ${(city as { name: string }).name}`,
    description: `Verified local businesses in ${(neighborhood as { name: string }).name}, ${(city as { name: string }).name}.`,
  };
}

export default async function NeighborhoodPage(
  {
    params,
    searchParams,
  }: { params: Promise<Params>; searchParams: Promise<SP> },
) {
  const [p, sp] = await Promise.all([params, searchParams]);
  const { supabase, city, neighborhood } = await loadContext(p);
  if (!city || !neighborhood) notFound();

  const pin = (await cookies()).get("pin")?.value ?? "";
  const pinFilter = isValidPin(pin) ? pin : null;
  const verifiedOnly = sp.verified === "1";
  const photoOnly = sp.photo === "1";
  const openOnly = sp.open === "1";

  let q = supabase
    .from("listings")
    .select(
      `id, name, slug, description, verified, pin_code, photo_url, hours_json,
       categories!inner ( name, slug )`,
    )
    .eq("status", "approved")
    .eq("neighborhood_id", (neighborhood as { id: string }).id);
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
    categories: { name: string; slug: string };
  };
  let rows = (listings ?? []) as unknown as Row[];
  if (photoOnly) rows = rows.filter((r) => !!r.photo_url);
  if (openOnly) rows = rows.filter((r) => isOpenNow(r.hours_json) === true);

  return (
    <Container size="3" px="4" py="6">
      <Flex direction="column" gap="4">
        <header>
          <Text size="1" color="gray">{(city as { name: string }).name}</Text>
          <Flex align="center" gap="2" mt="1">
            <Heading size="6">{(neighborhood as { name: string }).name}</Heading>
            {pinFilter ? <Badge color="grass">PIN {pinFilter}</Badge> : null}
          </Flex>
        </header>

        <CategoryFilterBar />

        {rows.length === 0 ? (
          <Text size="2" color="gray">No listings match these filters.</Text>
        ) : (
          <Grid columns="1" gap="3">
            {rows.map((l) => (
              <ListingCard
                key={l.id}
                href={`/${(city as { slug: string }).slug}/${(neighborhood as { slug: string }).slug}/${l.categories.slug}/${l.slug}`}
                name={l.name}
                category={l.categories.name}
                description={l.description}
                verified={l.verified}
                pin={l.pin_code}
                photo_url={l.photo_url}
                hours={l.hours_json}
              />
            ))}
          </Grid>
        )}
      </Flex>
    </Container>
  );
}
