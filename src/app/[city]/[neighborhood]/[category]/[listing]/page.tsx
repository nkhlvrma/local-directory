import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Container,
  Heading,
  Text,
  Flex,
  Badge,
  Card,
  Grid,
  Separator,
} from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { OpenNowBadge } from "@/components/OpenNowBadge";
import { HoursTable } from "@/components/HoursTable";
import { ShareButton } from "@/components/ShareButton";
import { TrackView } from "@/components/TrackView";
import { ListingCard } from "@/components/ListingCard";
import { SITE_URL } from "@/lib/site";
import type { WeekHours, FieldDef } from "@/lib/types";

type Params = {
  city: string;
  neighborhood: string;
  category: string;
  listing: string;
};

export const revalidate = 300;

async function loadListing(params: Params) {
  const supabase = await createSupabaseServerClient();
  const { data: city } = await supabase
    .from("cities")
    .select("id, name, slug")
    .eq("slug", params.city)
    .maybeSingle();
  if (!city) return null;

  const { data: neighborhood } = await supabase
    .from("neighborhoods")
    .select("id, name, slug")
    .eq("city_id", (city as { id: string }).id)
    .eq("slug", params.neighborhood)
    .maybeSingle();
  if (!neighborhood) return null;

  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug, fields_schema")
    .eq("slug", params.category)
    .maybeSingle();
  if (!category) return null;

  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, name, slug, description, whatsapp_number, photo_url, hours_json, verified, pin_code, fields_values",
    )
    .eq("status", "approved")
    .eq("neighborhood_id", (neighborhood as { id: string }).id)
    .eq("category_id", (category as { id: string }).id)
    .eq("slug", params.listing)
    .maybeSingle();
  if (!listing) return null;

  return {
    supabase,
    city: city as { name: string; slug: string; id: string },
    neighborhood: neighborhood as { name: string; slug: string; id: string },
    category: category as {
      name: string;
      slug: string;
      id: string;
      fields_schema: FieldDef[] | null;
    },
    listing: listing as {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      whatsapp_number: string;
      photo_url: string | null;
      hours_json: WeekHours | null;
      verified: boolean;
      pin_code: string | null;
      fields_values: Record<string, string | number | boolean | null> | null;
    },
  };
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const p = await params;
  const data = await loadListing(p);
  if (!data) return {};
  const { listing, category, neighborhood, city } = data;
  return {
    title: `${listing.name} — ${category.name} in ${neighborhood.name}`,
    description:
      listing.description ??
      `${category.name} in ${neighborhood.name}, ${city.name}.`,
    openGraph: {
      images: listing.photo_url ? [{ url: listing.photo_url }] : undefined,
    },
  };
}

export default async function ListingPage(
  { params }: { params: Promise<Params> },
) {
  const p = await params;
  const data = await loadListing(p);
  if (!data) notFound();
  const { supabase, city, neighborhood, category, listing } = data;

  // Similar listings: same category + same neighborhood, exclude self.
  const { data: similarRaw } = await supabase
    .from("listings")
    .select("id, name, slug, description, verified, pin_code, photo_url, hours_json")
    .eq("status", "approved")
    .eq("category_id", category.id)
    .eq("neighborhood_id", neighborhood.id)
    .order("whatsapp_clicks", { ascending: false })
    .limit(5);
  type Sim = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    verified: boolean;
    pin_code: string | null;
    photo_url: string | null;
    hours_json: WeekHours | null;
  };
  const similar = ((similarRaw ?? []) as unknown as Sim[])
    .filter((s) => s.id !== listing.id)
    .slice(0, 4);

  const canonical = `${SITE_URL}/${city.slug}/${neighborhood.slug}/${category.slug}/${listing.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: listing.name,
    description: listing.description ?? undefined,
    image: listing.photo_url ?? undefined,
    url: canonical,
    address: {
      "@type": "PostalAddress",
      addressLocality: neighborhood.name,
      addressRegion: city.name,
      postalCode: listing.pin_code ?? undefined,
      addressCountry: "IN",
    },
  };

  const fields = category.fields_schema ?? [];
  const values = listing.fields_values ?? {};
  const shownFields = fields.filter(
    (f) => values[f.key] !== undefined && values[f.key] !== null && values[f.key] !== "",
  );

  return (
    <Container size="3" px="4" py="6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrackView
        id={listing.id}
        name={listing.name}
        href={canonical.replace(SITE_URL, "")}
        category={category.name}
        neighborhood={neighborhood.name}
        photo_url={listing.photo_url}
        verified={listing.verified}
      />

      <Flex direction="column" gap="5">
        <Text size="1" color="gray">
          {city.name} · {neighborhood.name} · {category.name}
        </Text>

        {listing.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.photo_url}
            alt={listing.name}
            style={{
              width: "100%",
              maxHeight: 360,
              objectFit: "cover",
              borderRadius: 16,
            }}
          />
        ) : null}

        <header>
          <Flex align="center" gap="2" wrap="wrap">
            <Heading size="7">{listing.name}</Heading>
            {listing.verified ? <VerifiedBadge /> : null}
            <OpenNowBadge hours={listing.hours_json} />
            {listing.pin_code ? (
              <Badge color="gray" variant="soft">PIN {listing.pin_code}</Badge>
            ) : null}
          </Flex>
          {listing.description ? (
            <Text as="p" size="3" mt="2">{listing.description}</Text>
          ) : null}
        </header>

        <Flex gap="2" wrap="wrap">
          <WhatsAppButton listingId={listing.id} />
          <ShareButton
            title={listing.name}
            url={canonical}
            text={`Found ${listing.name} on Local Directory.`}
          />
        </Flex>

        {shownFields.length > 0 ? (
          <Card size="2">
            <Grid columns={{ initial: "1", sm: "2" }} gap="3">
              {shownFields.map((f) => (
                <Flex direction="column" key={f.key}>
                  <Text size="1" color="gray">{f.label}</Text>
                  <Text size="2" weight="medium">
                    {formatFieldValue(values[f.key], f)}
                  </Text>
                </Flex>
              ))}
            </Grid>
          </Card>
        ) : null}

        {listing.hours_json ? (
          <div>
            <Heading size="3" mb="2">Hours</Heading>
            <HoursTable hours={listing.hours_json} />
          </div>
        ) : null}

        {similar.length > 0 ? (
          <div>
            <Separator size="4" my="4" />
            <Heading size="3" mb="3">More {category.name.toLowerCase()} in {neighborhood.name}</Heading>
            <Grid columns="1" gap="3">
              {similar.map((s) => (
                <ListingCard
                  key={s.id}
                  href={`/${city.slug}/${neighborhood.slug}/${category.slug}/${s.slug}`}
                  name={s.name}
                  description={s.description}
                  verified={s.verified}
                  pin={s.pin_code}
                  photo_url={s.photo_url}
                  hours={s.hours_json}
                />
              ))}
            </Grid>
          </div>
        ) : null}

        <div style={{ borderTop: "1px solid var(--gray-a4)", paddingTop: "var(--space-3)" }}>
          <Link
            href={`/report?listing=${listing.id}`}
            style={{
              fontSize: 12,
              color: "var(--gray-11)",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <ExclamationTriangleIcon width={12} height={12} />
            Report this listing
          </Link>
        </div>
      </Flex>
    </Container>
  );
}

function formatFieldValue(
  v: string | number | boolean | null | undefined,
  f: FieldDef,
): string {
  if (v === null || v === undefined || v === "") return "—";
  if (f.type === "boolean") return v ? "Yes" : "No";
  return String(v);
}
