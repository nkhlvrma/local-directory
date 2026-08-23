import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { Container, Heading, Text, Flex, Grid, Badge } from "@radix-ui/themes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/ListingCard";
import { isValidPin } from "@/lib/pin";

type Params = { city: string; neighborhood: string };

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
  { params }: { params: Promise<Params> },
) {
  const p = await params;
  const { supabase, city, neighborhood } = await loadContext(p);
  if (!city || !neighborhood) notFound();

  const pin = (await cookies()).get("pin")?.value ?? "";
  const pinFilter = isValidPin(pin) ? pin : null;

  let q = supabase
    .from("listings")
    .select(
      `id, name, slug, description, verified, pin_code,
       categories!inner ( name, slug )`,
    )
    .eq("status", "approved")
    .eq("neighborhood_id", (neighborhood as { id: string }).id);
  if (pinFilter) q = q.eq("pin_code", pinFilter);
  const { data: listings } = await q.order("name");

  type Row = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    verified: boolean;
    pin_code: string | null;
    categories: { name: string; slug: string };
  };
  const rows = (listings ?? []) as unknown as Row[];

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

        {rows.length === 0 ? (
          <Text size="2" color="gray">
            {pinFilter
              ? `No listings at PIN ${pinFilter} in this neighborhood yet.`
              : "No listings yet in this neighborhood."}
          </Text>
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
              />
            ))}
          </Grid>
        )}
      </Flex>
    </Container>
  );
}
