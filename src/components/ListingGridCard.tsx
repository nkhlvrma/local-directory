import Link from "next/link";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { OpenNowBadge } from "./OpenNowBadge";
import { CategoryIcon } from "./CategoryIcon";
import type { WeekHours } from "@/lib/types";

type Props = {
  href: string;
  name: string;
  categorySlug: string; // used for the placeholder image when no photo exists
  neighborhood?: string | null;
  description?: string | null;
  verified?: boolean;
  pin?: string | null;
  photo_url?: string | null;
  hours?: WeekHours | null;
};

// Image-first card for grid browsing (category/neighborhood pages). Every
// listing gets a visual — a real photo when the business has one, otherwise
// a tinted placeholder using the category icon so the grid never looks
// half-empty.
export function ListingGridCard({
  href,
  name,
  categorySlug,
  neighborhood,
  description,
  verified,
  pin,
  photo_url,
  hours,
}: Props) {
  return (
    <Link href={href} className="block group h-full">
      <Card
        size="sm"
        className="h-full overflow-hidden gap-0 py-0 border border-border/70 shadow-none ring-0 transition-all hover:border-primary/30 hover:-translate-y-0.5"
      >
        <div className="aspect-4/3 w-full overflow-hidden bg-primary/5 relative">
          {photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo_url}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-primary/35">
              <CategoryIcon slug={categorySlug} size={40} strokeWidth={1.5} />
            </div>
          )}
          {verified ? (
            <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-background/90 backdrop-blur px-2 py-0.5 text-xs font-medium text-primary shadow-sm">
              <Check className="size-3" strokeWidth={2.5} />
              Verified
            </span>
          ) : null}
        </div>
        <CardContent className="flex flex-col gap-1 py-3">
          <span className="font-semibold text-sm leading-snug line-clamp-1">
            {name}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground">
            <OpenNowBadge hours={hours ?? null} />
            {neighborhood ? <span>{neighborhood}</span> : null}
            {pin ? (
              <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0">
                {pin}
              </Badge>
            ) : null}
          </div>
          {description ? (
            <p className="text-xs mt-0.5 line-clamp-2 text-foreground/70 leading-snug">
              {description}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
