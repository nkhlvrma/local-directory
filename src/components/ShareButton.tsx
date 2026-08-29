"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UploadIcon, type UploadIconHandle } from "@/components/ui/upload";
import { CheckIcon, type CheckIconHandle } from "@/components/ui/check";
import { trackEvent } from "@/lib/analytics-client";

export function ShareButton({
  title,
  url,
  text,
  listingId,
  iconOnly,
}: {
  title: string;
  url: string;
  text?: string;
  listingId?: string;
  iconOnly?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const icon = useRef<UploadIconHandle>(null);
  const check = useRef<CheckIconHandle>(null);

  // CheckIcon treats itself as externally controlled as soon as its
  // imperative handle exists, so it won't draw itself in unprompted — kick
  // it off when the copied state swaps it in.
  useEffect(() => {
    if (copied) check.current?.startAnimation();
  }, [copied]);

  async function onClick() {
    trackEvent("share_clicked", { listingId, metadata: { title } });
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // cancelled — fall through
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard blocked
    }
  }

  return (
    <Button
      // secondary, not outline — outline all but disappears against the
      // dark page background next to it.
      variant="secondary"
      size={iconOnly ? "icon" : "default"}
      onClick={onClick}
      aria-label={iconOnly ? (copied ? "Link copied" : "Share") : undefined}
      title={iconOnly ? "Share" : undefined}
      className={cn("rounded-full", iconOnly ? "size-11" : "h-11 px-5")}
      // Driven from the button so the arrow lifts on hovering the whole
      // control, not just the glyph.
      onMouseEnter={() => icon.current?.startAnimation()}
      onMouseLeave={() => icon.current?.stopAnimation()}
    >
      {copied ? (
        <CheckIcon ref={check} size={20} data-icon={iconOnly ? undefined : "inline-start"} />
      ) : (
        <UploadIcon ref={icon} size={20} data-icon={iconOnly ? undefined : "inline-start"} />
      )}
      {iconOnly ? null : copied ? "Link copied" : "Share"}
    </Button>
  );
}
