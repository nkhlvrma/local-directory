"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";
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
    <Button variant="outline" onClick={onClick}>
      {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
      {copied ? "Link copied" : "Share"}
    </Button>
  );
}
