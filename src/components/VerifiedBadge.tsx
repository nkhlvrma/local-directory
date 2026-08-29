"use client";

import { useRef } from "react";
import { CheckIcon, type CheckIconHandle } from "@/components/ui/check";

// Icon-only: the check plus the primary-tinted pill reads as "verified"
// without spending horizontal space on the word, which matters now that the
// badge sits inline beside the listing name. The label survives for screen
// readers and as a hover tooltip rather than being dropped.
//
// The animation is driven through the ref rather than relying on CheckIcon's
// own hover: that component flags itself as externally controlled whenever
// its imperative handle is created — which React does even when no ref is
// passed — so an unwired CheckIcon can never animate on its own.
export function VerifiedBadge() {
  const icon = useRef<CheckIconHandle>(null);

  return (
    <span
      role="img"
      aria-label="Verified"
      title="Verified — we messaged this WhatsApp and got a response."
      className="inline-flex size-7 items-center justify-center rounded-full text-amber-500 border border-amber-500/30 bg-amber-500/10"
      onMouseEnter={() => icon.current?.startAnimation()}
      onMouseLeave={() => icon.current?.stopAnimation()}
    >
      <CheckIcon ref={icon} size={18} />
    </span>
  );
}
