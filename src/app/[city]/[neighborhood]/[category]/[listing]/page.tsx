import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WhatsAppButton } from "@/components/WhatsAppButton";
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
    .eq("city_id", city.id)
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
    .select("id, name, slug, description, whatsapp_number, photo_url, hours_json")
    .eq("status", "approved")
    .eq("neighborhood_id", neighborhood.id)
    .eq("category_id", category.id)
    .eq("slug", params.listing)
    .maybeSingle();
  if (!listing) return null;

  return { city, neighborhood, category, listing };
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
      addressCountry: "IN",
    },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="text-xs text-black/60 dark:text-white/60">
        {city.name} · {neighborhood.name} · {category.name}
      </nav>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{listing.name}</h1>
        {listing.description ? (
          <p className="mt-2 text-black/80 dark:text-white/80">
            {listing.description}
          </p>
        ) : null}
      </header>

      <div>
        <WhatsAppButton
          number={listing.whatsapp_number}
          listingName={listing.name}
        />
      </div>

      <div className="pt-4 border-t border-black/5 dark:border-white/10">
        <a
          href={`/report?listing=${listing.id}`}
          className="text-xs text-black/50 dark:text-white/50 underline"
        >
          Report this listing
        </a>
      </div>
    </div>
  );
}
