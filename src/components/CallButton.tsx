"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PhoneCallIcon, type PhoneCallIconHandle } from "@/components/ui/phone-call";

type Props = {
  listingId: string;
  className?: string;
  // Icon-only for the detail-page action cluster. Opt-in because the mobile
  // sticky bar shares this component and still wants its label.
  iconOnly?: boolean;
};

// Secondary contact channel next to WhatsAppButton. Routes through
// /api/call/[id] (mirrors /api/wa/[id]) so we can log a "call_clicked"
// event before handing off to the phone dialer via tel:.
//
// The icon animation is driven from the button's own hover rather than the
// icon's, so it fires anywhere on the control instead of only when the
// pointer happens to cross the glyph itself.
export function CallButton({ listingId, className, iconOnly }: Props) {
  const icon = useRef<PhoneCallIconHandle>(null);

  return (
    <Button
      asChild
      // secondary, not outline: an outline button is nearly invisible
      // against the dark page background here.
      variant="secondary"
      size={iconOnly ? "icon" : "default"}
      className={cn(
        "rounded-full",
        iconOnly ? "size-11" : "h-11 px-5",
        className,
      )}
      onMouseEnter={() => icon.current?.startAnimation()}
      onMouseLeave={() => icon.current?.stopAnimation()}
    >
      <a
        href={`/api/call/${listingId}`}
        aria-label={iconOnly ? "Call" : undefined}
        title={iconOnly ? "Call" : undefined}
      >
        <PhoneCallIcon
          ref={icon}
          size={20}
          data-icon={iconOnly ? undefined : "inline-start"}
        />
        {iconOnly ? null : "Call"}
      </a>
    </Button>
  );
}
