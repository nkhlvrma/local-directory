import Link from "next/link";
import { cookies } from "next/headers";
import {
  Container,
  Heading,
  Text,
  Grid,
  Flex,
  Card,
  Callout,
  Badge,
} from "@radix-ui/themes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CITY_SLUG } from "@/lib/site";
import { ListingCard } from "@/components/ListingCard";
import { isValidPin } from "@/lib/pin";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const pin = (await cookies()).get("pin")?.value ?? "";
  const pinFilter = isValidPin(pin) ? pin : null;

  const { data: city } = await supabase
    .from("cities")
    .select("id, name, slug")
    .eq("slug", CITY_SLUG)
    .maybeSingle();

  if (!city) {
    return (
      <Container size="3" px="4" py="8">
        <Heading size="6">Setup incomplete</Heading>
        <Text as="p" color="gray" size="2" mt="2">
          No active city found for slug <code>{CITY_SLUG}</code>. Run the
          Supabase schema and set <code>NEXT_PUBLIC_CITY_SLUG</code>.
        </Text>
      </Container>
    );
  }

  const [{ data: categories }, { data: neighborhoods }, nearbyRes] =
    await Promise.all([
      supabase.from("categories").select("name, slug, icon").order("name"),
      supabase
        .from("neighborhoods")
        .select("name, slug")
        .eq("city_id", (city as { id: string }).id)
        .order("name"),
      pinFilter
        ? supabase
            .from("listings")
            .select(
              `id, name, slug, description, verified, pin_code,
               neighborhoods!inner ( name, slug ),
               categories!inner ( name, slug )`,
            )
            .eq("status", "approved")
            .eq("pin_code", pinFilter)
            .order("name")
            .limit(20)
        : Promise.resolve({ data: null }),
    ]);

  type Nearby = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    verified: boolean;
    pin_code: string | null;
    neighborhoods: { name: string; slug: string };
    categories: { name: string; slug: string };
  };
  const nearby = ((nearbyRes.data ?? []) as unknown as Nearby[]);

  const cats = (categories ?? []) as { slug: string; name: string; icon: string | null }[];
  const hoods = (neighborhoods ?? []) as { slug: string; name: string }[];

  return (
    <Container size="3" px="4" py="6">
      <Flex direction="column" gap="6">
        <div>
          <Text size="1" color="gray" style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {(city as { name: string }).name}
          </Text>
          <Heading size="8" mt="1">Find someone nearby.</Heading>
          <Text as="p" size="3" color="gray" mt="2">
            Every listing is verified. Tap to chat on WhatsApp — no forms, no
            call-backs.
          </Text>
        </div>

        {pinFilter ? (
          nearby.length > 0 ? (
            <section>
              <Flex align="baseline" gap="2" mb="3">
                <Heading size="4">Near PIN</Heading>
                <Badge color="grass">{pinFilter}</Badge>
              </Flex>
              <Grid columns={{ initial: "1", sm: "2" }} gap="3">
                {nearby.map((l) => (
                  <ListingCard
                    key={l.id}
                    href={`/${(city as { slug: string }).slug}/${l.neighborhoods.slug}/${l.categories.slug}/${l.slug}`}
                    name={l.name}
                    category={l.categories.name}
                    neighborhood={l.neighborhoods.name}
                    description={l.description}
                    verified={l.verified}
                    pin={l.pin_code}
                  />
                ))}
              </Grid>
            </section>
          ) : (
            <Callout.Root color="gray">
              <Callout.Text>
                No listings yet at PIN {pinFilter}. Browse by category below.
              </Callout.Text>
            </Callout.Root>
          )
        ) : null}

        <section>
          <Heading size="3" color="gray" mb="3">Browse by category</Heading>
          <Grid columns={{ initial: "2", sm: "3" }} gap="2">
            {cats.map((c) => (
              <Link
                key={c.slug}
                href={`/${(city as { slug: string }).slug}/${c.slug}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Card size="2">
                  <Flex direction="column" gap="1">
                    <Text size="5">{c.icon ?? "•"}</Text>
                    <Text size="2" weight="medium">{c.name}</Text>
                  </Flex>
                </Card>
              </Link>
            ))}
          </Grid>
        </section>

        <section>
          <Heading size="3" color="gray" mb="3">Browse by neighborhood</Heading>
          <Flex gap="2" wrap="wrap">
            {hoods.map((n) => (
              <Link
                key={n.slug}
                href={`/${(city as { slug: string }).slug}/n/${n.slug}`}
                style={{ textDecoration: "none" }}
              >
                <Badge size="2" variant="soft" color="gray" style={{ cursor: "pointer" }}>
                  {n.name}
                </Badge>
              </Link>
            ))}
          </Flex>
        </section>
      </Flex>
    </Container>
  );
}
