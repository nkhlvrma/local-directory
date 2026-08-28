"use client";

import Link from "next/link";
import { ExternalLink, MapPin } from "lucide-react";
import { CITY_MAPS } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import { Card, CardFooter } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics-client";

export function NeighborhoodMap({
  citySlug,
  cityName,
  neighborhoods,
}: {
  citySlug: string;
  cityName: string;
  neighborhoods: { slug: string; name: string }[];
}) {
  const map = CITY_MAPS[citySlug] ?? CITY_MAPS.lucknow;
  const bbox = map.bounds.join("%2C");
  const embedUrl =
    `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}` +
    `&layer=mapnik&marker=${map.latitude}%2C${map.longitude}`;
  const mapUrl = `https://www.openstreetmap.org/?mlat=${map.latitude}&mlon=${map.longitude}#map=${map.zoom}/${map.latitude}/${map.longitude}`;

  return (
    <section aria-labelledby="neighborhood-map-title" className="space-y-4 py-6">
      <div>
        <h2
          id="neighborhood-map-title"
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          Browse by neighborhood
        </h2>
      </div>
      <Card
        size="sm"
        className="overflow-hidden gap-0 py-0 border shadow-none ring-0 bg-muted/30"
      >
        <iframe
          title={`${cityName} map`}
          src={embedUrl}
          className="block h-72 w-full border-0 sm:h-80"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <CardFooter className="border-t bg-background justify-between gap-4 py-3">
          <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">{cityName} and nearby neighborhoods</span>
          </div>
          <a
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent("map_interacted", { metadata: { action: "open_map" } })}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Open map
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </CardFooter>
      </Card>
      {neighborhoods.length > 0 ? (
        <div className="flex flex-wrap gap-2 py-3">
          {neighborhoods.map((neighborhood) => (
            <Link
              key={neighborhood.slug}
              href={`/${citySlug}/n/${neighborhood.slug}`}
              onClick={() =>
                trackEvent("map_interacted", {
                  metadata: { action: "neighborhood_badge", neighborhood: neighborhood.slug },
                })
              }
            >
              <Badge
                variant="outline"
                className="cursor-pointer py-1.5 px-3 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors"
              >
                {neighborhood.name}
              </Badge>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
