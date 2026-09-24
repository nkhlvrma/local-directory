"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import type { CheckIconHandle } from "@/components/ui/check";
import { useContactIcons } from "@/components/ui/contact-icons";

// How long to wait between replays of the check-draw.
const LOOP_INTERVAL_MS = 2600;

// Icon-only: the check plus the amber pill reads as "verified" without
// spending horizontal space on the word, which matters now that the badge
// sits inline beside the listing name. The label survives for screen readers
// and as a hover tooltip rather than being dropped.
//
// The check replays on a loop rather than only on hover, so the badge still
// draws the eye on a page nobody is pointing at. CheckIcon treats itself as
// externally controlled the moment its imperative handle exists — which
// React does even with no ref passed — so the loop has to drive it here.
export function VerifiedBadge() {
  // The animated check arrives on an idle callback (see useContactIcons) so
  // the badge doesn't put Motion in the page's first load; until then the
  // static check is drawn, which is the animation's end state anyway.
  const icons = useContactIcons();
  const icon = useRef<CheckIconHandle>(null);

  useEffect(() => {
    // An animation that never stops is exactly what reduced-motion asks us
    // not to do, so honour the preference and leave the check drawn.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const play = () => icon.current?.startAnimation();
    play();
    const id = setInterval(play, LOOP_INTERVAL_MS);
    return () => clearInterval(id);
  }, [icons]);

  return (
    <span
      role="img"
      aria-label="Verified"
      title="Verified — we messaged this WhatsApp and got a response."
      className="inline-flex size-7 items-center justify-center rounded-full text-amber-500 border border-amber-500/30 bg-amber-500/10"
    >
      {icons ? (
        <icons.CheckIcon ref={icon} size={18} />
      ) : (
        <Check size={18} />
      )}
    </span>
  );
}
