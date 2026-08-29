"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { CITY_MAPS } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics-client";

export type MapNeighborhood = {
  slug: string;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
};

export function NeighborhoodMap({
  citySlug,
  cityName,
  neighborhoods,
}: {
  citySlug: string;
  cityName: string;
  neighborhoods: MapNeighborhood[];
}) {
  const map = CITY_MAPS[citySlug] ?? CITY_MAPS.lucknow;
  const [minLon, minLat, maxLon, maxLat] = map.bounds;
  const bbox = map.bounds.join("%2C");
  const embedUrl =
    `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}` +
    `&layer=mapnik`;

  // Percentage position of a coordinate inside the embed's bounding box.
  // A linear projection is fine here: the box spans a fraction of a degree,
  // where Mercator's latitude stretch is far smaller than the pin itself.
  const place = (lat: number, lon: number) => ({
    left: `${((lon - minLon) / (maxLon - minLon)) * 100}%`,
    top: `${((maxLat - lat) / (maxLat - minLat)) * 100}%`,
  });

  const pinned = neighborhoods.filter(
    (n): n is MapNeighborhood & { latitude: number; longitude: number } =>
      typeof n.latitude === "number" && typeof n.longitude === "number",
  );

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
        className="relative overflow-hidden gap-0 py-0 border shadow-none ring-0 bg-muted/30"
      >
        {/* The embed is a backdrop, not a map you drive: pins are positioned
            against a fixed bounding box, so letting the iframe pan or zoom
            would slide the map out from under them. Navigation is the pins
            and the badges below instead. */}
        <iframe
          title={`${cityName} map`}
          src={embedUrl}
          className="pointer-events-none block h-80 w-full border-0 sm:h-96"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />

        {pinned.map((n) => (
          <Link
            key={n.slug}
            href={`/${citySlug}/n/${n.slug}`}
            style={place(n.latitude, n.longitude)}
            onClick={() =>
              trackEvent("map_interacted", {
                metadata: { action: "map_pin", neighborhood: n.slug },
              })
            }
            // -translate-x-1/2 puts the pin's point on the coordinate, and
            // -translate-y-full stands it above rather than centred on it.
            className="group/pin absolute z-10 flex -translate-x-1/2 -translate-y-full flex-col items-center"
          >
            <span className="rounded-full bg-background/90 px-1.5 py-0.5 text-[10px] font-medium leading-tight shadow-sm ring-1 ring-border whitespace-nowrap group-hover/pin:bg-primary group-hover/pin:text-primary-foreground transition-colors">
              {n.name}
            </span>
            <MapPin
              className="size-4 -mt-0.5 text-primary drop-shadow-sm fill-background group-hover/pin:scale-110 transition-transform"
              aria-hidden="true"
            />
          </Link>
        ))}
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
