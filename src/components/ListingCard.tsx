import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "./VerifiedBadge";
import { OpenNowBadge } from "./OpenNowBadge";
import type { WeekHours } from "@/lib/types";

type Props = {
  href: string;
  name: string;
  category?: string | null;
  neighborhood?: string | null;
  description?: string | null;
  verified?: boolean;
  pin?: string | null;
  photo_url?: string | null;
  hours?: WeekHours | null;
};

export function ListingCard({
  href,
  name,
  category,
  neighborhood,
  description,
  verified,
  pin,
  photo_url,
  hours,
}: Props) {
  return (
    <Link href={href} className="block">
      <Card className="p-4 transition-colors hover:bg-muted/50">
        <div className="flex items-start gap-3">
          {photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo_url}
              alt=""
              loading="lazy"
              className="size-18 shrink-0 rounded-lg object-cover"
              style={{ width: 72, height: 72 }}
            />
          ) : null}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{name}</span>
              {verified ? <VerifiedBadge /> : null}
              <OpenNowBadge hours={hours ?? null} />
              {pin ? <Badge variant="secondary">PIN {pin}</Badge> : null}
            </div>
            <div className="text-xs text-muted-foreground">
              {[category, neighborhood].filter(Boolean).join(" · ")}
            </div>
            {description ? (
              <p className="text-sm line-clamp-2">{description}</p>
            ) : null}
          </div>
        </div>
      </Card>
    </Link>
  );
}
