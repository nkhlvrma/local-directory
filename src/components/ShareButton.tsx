"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadIcon, type UploadIconHandle } from "@/components/ui/upload";
import { CheckIcon, type CheckIconHandle } from "@/components/ui/check";
import { trackEvent } from "@/lib/analytics-client";

export function ShareButton({
  title,
  url,
  text,
  listingId,
}: {
  title: string;
  url: string;
  text?: string;
  listingId?: string;
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
      variant="outline"
      onClick={onClick}
      className="h-11 min-h-11 px-5"
      // Driven from the button so the arrow lifts on hovering the whole
      // control, not just the glyph.
      onMouseEnter={() => icon.current?.startAnimation()}
      onMouseLeave={() => icon.current?.stopAnimation()}
    >
      {copied ? (
        <CheckIcon ref={check} size={20} />
      ) : (
        <UploadIcon ref={icon} size={20} />
      )}
      {copied ? "Link copied" : "Share"}
    </Button>
  );
}
