"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { PhoneCallIcon, type PhoneCallIconHandle } from "@/components/ui/phone-call";

type Props = {
  listingId: string;
  className?: string;
};

// Secondary contact channel next to WhatsAppButton. Routes through
// /api/call/[id] (mirrors /api/wa/[id]) so we can log a "call_clicked"
// event before handing off to the phone dialer via tel:.
//
// The icon animation is driven from the button's own hover rather than the
// icon's, so it fires anywhere on the control instead of only when the
// pointer happens to cross the glyph itself.
export function CallButton({ listingId, className }: Props) {
  const icon = useRef<PhoneCallIconHandle>(null);

  return (
    <Button
      asChild
      variant="outline"
      className={`h-11 min-h-11 px-5 ${className ?? ""}`}
      onMouseEnter={() => icon.current?.startAnimation()}
      onMouseLeave={() => icon.current?.stopAnimation()}
    >
      <a href={`/api/call/${listingId}`}>
        <PhoneCallIcon ref={icon} size={20} />
        Call
      </a>
    </Button>
  );
}
