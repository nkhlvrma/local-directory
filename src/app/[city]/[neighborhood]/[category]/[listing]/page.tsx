import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
    <>
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

      {/* Photo hero */}
      {listing.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={listing.photo_url}
          alt={listing.name}
          className="w-full object-cover"
          style={{ maxHeight: 400 }}
        />
      ) : null}

      <Container className="py-7 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
          <Link href={`/${city.slug}/c/${category.slug}`} className="hover:text-foreground transition-colors">
            {category.name}
          </Link>
          <ChevronRight className="size-3 shrink-0" />
          <span>{neighborhood.name}</span>
        </nav>

        {/* Header */}
        <header className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">{listing.name}</h1>
            {listing.verified ? <VerifiedBadge /> : null}
            <OpenNowBadge hours={listing.hours_json} />
            {listing.pin_code ? (
              <Badge variant="secondary" className="font-mono">
                {listing.pin_code}
              </Badge>
            ) : null}
          </div>
          {listing.description ? (
            <p className="text-base text-foreground/80 leading-relaxed max-w-prose">
              {listing.description}
            </p>
          ) : null}
        </header>

        {/* CTA */}
        <div className="flex gap-2 flex-wrap items-center">
          <WhatsAppButton listingId={listing.id} />
          <ShareButton
            title={listing.name}
            url={canonical}
            text={`Found ${listing.name} on Local Directory.`}
          />
        </div>

        {/* Custom fields */}
        {shownFields.length > 0 ? (
          <div className="rounded-xl border border-border/70 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {shownFields.map((f) => (
                <div key={f.key}>
                  <div className="text-xs text-muted-foreground">{f.label}</div>
                  <div className="text-sm font-medium mt-0.5">
                    {formatFieldValue(values[f.key], f)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Hours */}
        {listing.hours_json ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Hours
            </h2>
            <HoursTable hours={listing.hours_json} />
          </div>
        ) : null}

        {/* Similar */}
        {similar.length > 0 ? (
          <div>
            <Separator className="mb-6" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              More {category.name.toLowerCase()} in {neighborhood.name}
            </h2>
            <div className="grid gap-2">
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
            </div>
          </div>
        ) : null}

        {/* Report */}
        <div className="border-t pt-4">
          <Link
            href={`/report?listing=${listing.id}`}
            className="text-xs text-muted-foreground inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <AlertTriangle className="size-3" />
            Report this listing
          </Link>
        </div>
      </Container>
    </>
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
