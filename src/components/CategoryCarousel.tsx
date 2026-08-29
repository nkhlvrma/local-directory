"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CategoryCard } from "./CategoryCard";

type Category = {
  slug: string;
  name: string;
  icon: string | null;
  href: string;
};

export function CategoryCarousel({ categories }: { categories: Category[] }) {
  return (
    <Carousel
      opts={{ align: "start", loop: categories.length > 4 }}
      className="px-8 sm:px-10"
    >
      <CarouselContent className="-ml-2">
        {categories.map((category) => (
          <CarouselItem
            key={category.slug}
            // basis-auto so each card hugs its label instead of being
            // stretched to a fixed fraction of the track — at desktop
            // widths a quarter-width card left the icon and a two-word
            // label floating in ~250px of empty space. The min-width keeps
            // short names ("Salons") from collapsing to a stub.
            className="basis-auto pl-2 min-w-36"
          >
            <CategoryCard
              slug={category.slug}
              name={category.name}
              icon={category.icon}
              href={category.href}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      {categories.length > 4 ? (
        <>
          <CarouselPrevious
            aria-label="Show previous categories"
            className="left-0"
          />
          <CarouselNext
            aria-label="Show next categories"
            className="right-0"
          />
        </>
      ) : null}
    </Carousel>
  );
}
