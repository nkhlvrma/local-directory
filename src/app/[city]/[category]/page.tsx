import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { Container, Heading, Text, Flex, Grid, Badge } from "@radix-ui/themes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/ListingCard";
import { isValidPin } from "@/lib/pin";

type Params = { city: string; category: string };

export const dynamic = "force-dynamic";

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
    title: `${(category as { name: string }).name} in ${(city as { name: string }).name}`,
    description: `Verified ${(category as { name: string }).name.toLowerCase()} in ${(city as { name: string }).name}. Chat on WhatsApp directly.`,
  };
}

export default async function CategoryPage(
  { params }: { params: Promise<Params> },
) {
  const p = await params;
  const { supabase, city, category } = await loadContext(p);
  if (!city || !category) notFound();

  const pin = (await cookies()).get("pin")?.value ?? "";
  const pinFilter = isValidPin(pin) ? pin : null;

  let q = supabase
    .from("listings")
    .select(
      `id, name, slug, description, verified, pin_code,
       neighborhoods!inner ( name, slug, city_id ),
       categories!inner ( name, slug )`,
    )
    .eq("status", "approved")
    .eq("category_id", (category as { id: string }).id)
    .eq("neighborhoods.city_id", (city as { id: string }).id);
  if (pinFilter) q = q.eq("pin_code", pinFilter);
  const { data: listings } = await q.order("name");

  type Row = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    verified: boolean;
    pin_code: string | null;
    neighborhoods: { name: string; slug: string };
  };
  const rows = (listings ?? []) as unknown as Row[];

  return (
    <Container size="3" px="4" py="6">
      <Flex direction="column" gap="4">
        <header>
          <Text size="1" color="gray">{(city as { name: string }).name}</Text>
          <Flex align="center" gap="2" mt="1">
            <Heading size="6">{(category as { name: string }).name}</Heading>
            {pinFilter ? <Badge color="grass">PIN {pinFilter}</Badge> : null}
          </Flex>
        </header>

        {rows.length === 0 ? (
          <Text size="2" color="gray">
            {pinFilter
              ? `No ${(category as { name: string }).name.toLowerCase()} listed at PIN ${pinFilter} yet.`
              : "No listings yet in this category."}
          </Text>
        ) : (
          <Grid columns="1" gap="3">
            {rows.map((l) => (
              <ListingCard
                key={l.id}
                href={`/${(city as { slug: string }).slug}/${l.neighborhoods.slug}/${(category as { slug: string }).slug}/${l.slug}`}
                name={l.name}
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
