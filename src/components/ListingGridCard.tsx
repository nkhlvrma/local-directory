import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { OpenNowBadge } from "./OpenNowBadge";
import { CategoryIcon } from "./CategoryIcon";
import { ListingCardLink } from "./ListingCardLink";
import type { WeekHours } from "@/lib/types";

type Props = {
  id: string;
  href: string;
  name: string;
  categorySlug: string; // used for the placeholder image when no photo exists
  categoryIcon?: string | null; // DB-stored Lucide icon name, auto-assigned per category
  subtitle?: string | null; // secondary label — neighborhood, category, or both
  description?: string | null;
  photo_url?: string | null;
  hours?: WeekHours | null;
};

// Image-first card for grid browsing (category/neighborhood pages). Every
// listing gets a visual — a real photo when the business has one, otherwise
// a tinted placeholder using the category icon so the grid never looks
// half-empty.
export function ListingGridCard({
  id,
  href,
  name,
  categorySlug,
  categoryIcon,
  subtitle,
  description,
  photo_url,
  hours,
}: Props) {
  return (
    <ListingCardLink href={href} listingId={id} className="block group h-full">
      <Card
        size="sm"
        className="h-full gap-0 py-0 border-0 bg-transparent shadow-none ring-0 overflow-visible transition-transform hover:-translate-y-0.5"
      >
        <div className="aspect-square w-[200px] max-w-full overflow-hidden rounded-2xl bg-primary/5 relative">
          {photo_url ? (
            <Image
              src={photo_url}
              alt=""
              fill
              sizes="200px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-primary/35">
              <CategoryIcon
                slug={categorySlug}
                icon={categoryIcon}
                size={40}
                strokeWidth={1.5}
              />
            </div>
          )}
        </div>
        <CardContent className="flex flex-col gap-1 px-0 py-3">
          <span className="font-semibold text-xl leading-snug line-clamp-1">
            {name}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap text-sm text-muted-foreground">
            <OpenNowBadge hours={hours ?? null} />
            {subtitle ? <span>{subtitle}</span> : null}
          </div>
          {description ? (
            <p className="text-sm mt-0.5 line-clamp-2 text-foreground/70 leading-snug">
              {description}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </ListingCardLink>
  );
}
