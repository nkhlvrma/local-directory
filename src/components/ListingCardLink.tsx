"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics-client";

// Thin client wrapper so the (server-rendered) ListingGridCard can still log
// a "listing_card_click" event on tap/click without becoming a client
// component itself. Mirrors the side-effect-only convention in TrackView.
export function ListingCardLink({
  href,
  listingId,
  className,
  children,
}: {
  href: string;
  listingId: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        trackEvent("listing_card_click", { listingId, metadata: { href } })
      }
    >
      {children}
    </Link>
  );
}
