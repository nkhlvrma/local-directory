"use client";

import { useState } from "react";
import { Button } from "@radix-ui/themes";
import { Share2, Check } from "lucide-react";

export function ShareButton({
  title,
  url,
  text,
}: {
  title: string;
  url: string;
  text?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    // Try native share first (mobile). Fall back to clipboard.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // user cancelled or unsupported — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard blocked; give up silently
    }
  }

  return (
    <Button variant="soft" color="gray" size="2" onClick={onClick}>
      {copied ? <Check size={14} /> : <Share2 size={14} />}
      {copied ? "Link copied" : "Share"}
    </Button>
  );
}
