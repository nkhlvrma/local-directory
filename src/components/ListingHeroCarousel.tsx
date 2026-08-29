"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { HEADER_HEIGHT } from "@/lib/site";
import { cn } from "@/lib/utils";

// Full-bleed hero for the listing detail page. Pulled up behind the
// transparent header (see SiteHeader) so the artwork reaches the top of the
// viewport, and marked data-page-hero so the header knows to overlay it.
//
// A single image renders without any carousel chrome — arrows and dots on a
// one-slide carousel just look broken.
export function ListingHeroCarousel({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  if (images.length === 0) return null;

  const multiple = images.length > 1;

  return (
    <div
      data-page-hero
      className="relative w-full h-[400px] sm:h-[500px]"
      style={{ marginTop: -HEADER_HEIGHT }}
    >
      {multiple ? (
        <Carousel
          setApi={setApi}
          opts={{ loop: true }}
          className="h-full [&>[data-slot=carousel-content]]:h-full"
        >
          <CarouselContent className="h-full ml-0">
            {images.map((src, i) => (
              <CarouselItem key={src} className="h-full pl-0 relative">
                <Image
                  src={src}
                  alt={i === 0 ? alt : `${alt} — photo ${i + 1}`}
                  fill
                  // Only the first slide is above the fold on load; letting
                  // the rest load lazily keeps them out of the initial
                  // critical path.
                  priority={i === 0}
                  loading={i === 0 ? undefined : "lazy"}
                  sizes="100vw"
                  className="object-cover"
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="left-4 text-white bg-black/35 hover:bg-black/55 hover:text-white" />
          <CarouselNext className="right-4 text-white bg-black/35 hover:bg-black/55 hover:text-white" />

          {/* Position indicator — cheaper to read at a glance than counting
              slides, and it doubles as a jump target. */}
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-0.5">
            {images.map((src, i) => (
              <Button
                key={src}
                variant="ghost"
                size="icon-xs"
                aria-label={`Go to photo ${i + 1}`}
                aria-current={i === current}
                onClick={() => api?.scrollTo(i)}
                // The dot itself is only a few pixels tall, which is far
                // below a usable tap target — so the control is a normal
                // icon-sized button with no chrome, and the dot is drawn
                // inside it.
                className="size-6 rounded-full bg-transparent hover:bg-white/15"
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-all duration-200",
                    i === current ? "w-5 bg-white" : "w-1.5 bg-white/55",
                  )}
                />
              </Button>
            ))}
          </div>
        </Carousel>
      ) : (
        <Image
          src={images[0]}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}

      {/* Scrim behind the header strip only — these photos are arbitrary and
          often bright at the top, and the header's white text needs a
          guaranteed dark backing to stay legible over them. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 bg-linear-to-b from-black/55 to-transparent"
        style={{ height: HEADER_HEIGHT * 2 }}
      />
    </div>
  );
}
