import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Container, Heading, Text, Flex, Badge } from "@radix-ui/themes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { SITE_URL } from "@/lib/site";

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
    .select("id, name, slug")
    .eq("slug", params.category)
    .maybeSingle();
  if (!category) return null;

  const { data: listing } = await supabase
    .from("listings")
    .select("id, name, slug, description, whatsapp_number, photo_url, hours_json, verified, pin_code")
    .eq("status", "approved")
    .eq("neighborhood_id", (neighborhood as { id: string }).id)
    .eq("category_id", (category as { id: string }).id)
    .eq("slug", params.listing)
    .maybeSingle();
  if (!listing) return null;

  return {
    city: city as { name: string; slug: string },
    neighborhood: neighborhood as { name: string; slug: string },
    category: category as { name: string; slug: string },
    listing: listing as {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      whatsapp_number: string;
      photo_url: string | null;
      hours_json: Record<string, string> | null;
      verified: boolean;
      pin_code: string | null;
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
  };
}

export default async function ListingPage(
  { params }: { params: Promise<Params> },
) {
  const p = await params;
  const data = await loadListing(p);
  if (!data) notFound();
  const { city, neighborhood, category, listing } = data;

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

  return (
    <Container size="3" px="4" py="6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Flex direction="column" gap="4">
        <Text size="1" color="gray">
          {city.name} · {neighborhood.name} · {category.name}
        </Text>
        <header>
          <Flex align="center" gap="2" wrap="wrap">
            <Heading size="7">{listing.name}</Heading>
            {listing.verified ? <VerifiedBadge /> : null}
            {listing.pin_code ? (
              <Badge color="gray" variant="soft">PIN {listing.pin_code}</Badge>
            ) : null}
          </Flex>
          {listing.description ? (
            <Text as="p" size="3" mt="2">{listing.description}</Text>
          ) : null}
        </header>

        <div>
          <WhatsAppButton listingId={listing.id} />
        </div>

        <div style={{ borderTop: "1px solid var(--gray-a4)", paddingTop: "var(--space-3)" }}>
          <Link href={`/report?listing=${listing.id}`} style={{ fontSize: 12, color: "var(--gray-11)" }}>
            Report this listing
          </Link>
        </div>
      </Flex>
    </Container>
  );
}
