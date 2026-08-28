import Link from "next/link";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    <Link href={href} className="block group">
      <Card
        size="sm"
        className="border border-border/70 shadow-none ring-0 transition-all hover:border-primary/30 hover:bg-muted/30"
      >
        <CardContent className="flex gap-3">
          {photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo_url}
              alt=""
              loading="lazy"
              className="size-16 shrink-0 rounded-lg object-cover"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm leading-snug">{name}</span>
              {verified ? (
                <span
                  title="Verified — we messaged this WhatsApp and got a response"
                  className="inline-flex items-center"
                >
                  <Check className="size-3.5 text-primary" strokeWidth={2.5} />
                </span>
              ) : null}
              <OpenNowBadge hours={hours ?? null} />
              {pin ? (
                <Badge variant="secondary" className="text-xs font-mono">
                  {pin}
                </Badge>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {[neighborhood, category].filter(Boolean).join(" · ")}
            </p>
            {description ? (
              <p className="text-sm mt-1.5 line-clamp-2 text-foreground/75 leading-snug">
                {description}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
