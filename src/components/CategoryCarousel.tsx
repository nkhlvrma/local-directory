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
            className="basis-1/2 pl-2 sm:basis-1/4"
          >
            <CategoryCard
              slug={category.slug}
              name={category.name}
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
