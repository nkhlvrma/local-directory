"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CITY_MAPS } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics-client";
import "leaflet/dist/leaflet.css";

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
  const container = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Leaflet rather than an OpenStreetMap embed iframe: pins have to stay
  // anchored to their coordinates while the map pans and zooms, and an
  // iframe gives no way to do that (its viewport is cross-origin, so an
  // overlay can only be positioned against a bounding box that stops being
  // true the moment anyone drags the map).
  useEffect(() => {
    const el = container.current;
    if (!el) return;

    const map = CITY_MAPS[citySlug] ?? CITY_MAPS.lucknow;
    const pinned = neighborhoods.filter(
      (n): n is MapNeighborhood & { latitude: number; longitude: number } =>
        typeof n.latitude === "number" && typeof n.longitude === "number",
    );

    let instance: import("leaflet").Map | undefined;
    let cancelled = false;

    // Imported here rather than at module scope so Leaflet lands in its own
    // async chunk instead of the page's initial JS.
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !container.current) return;

      instance = L.map(el, {
        center: [map.latitude, map.longitude],
        zoom: map.zoom,
        scrollWheelZoom: false, // let the page scroll past the map normally
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(instance);

      for (const n of pinned) {
        // A DivIcon avoids Leaflet's default marker PNGs, whose bundler-
        // hostile relative URLs would need patching, and lets the pin match
        // the rest of the UI.
        const icon = L.divIcon({
          className: "",
          html:
            `<span class="flex flex-col items-center -translate-y-1/2">` +
            `<span class="rounded-full bg-background/90 px-1.5 py-0.5 text-[10px] font-medium leading-tight shadow-sm ring-1 ring-border whitespace-nowrap">${n.name}</span>` +
            `<span class="size-2 rotate-45 -mt-1 bg-primary ring-1 ring-background"></span>` +
            `</span>`,
          iconSize: [0, 0],
        });

        L.marker([n.latitude, n.longitude], { icon, title: n.name })
          .addTo(instance)
          .on("click", () => {
            trackEvent("map_interacted", {
              metadata: { action: "map_pin", neighborhood: n.slug },
            });
            // router.push, not window.location: keeps it a client-side
            // navigation instead of a full document reload.
            router.push(`/${citySlug}/n/${n.slug}`);
          });
      }
    })();

    return () => {
      cancelled = true;
      instance?.remove();
    };
  }, [citySlug, neighborhoods, router]);

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
        <div
          ref={container}
          role="application"
          aria-label={`Map of ${cityName} neighborhoods`}
          className="h-80 w-full sm:h-96 z-0"
        />
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
