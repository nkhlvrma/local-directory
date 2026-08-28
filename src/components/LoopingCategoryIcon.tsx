"use client";

import { useEffect, useState } from "react";
import { AnimatedCategoryIcon } from "./AnimatedCategoryIcon";

// Replays the category icon's hover animation on a loop. Used where there's
// no hover surface to drive AnimatedCategoryIcon naturally (e.g. a page
// heading), so the icon still feels alive instead of sitting static.
const ON_MS = 1200; // covers the slowest icon animation (wrench, ~1.05s)
const OFF_MS = 1400; // pause between replays

export function LoopingCategoryIcon({
  slug,
  size = 24,
}: {
  slug: string;
  size?: number;
}) {
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout>;

    function loop(on: boolean) {
      setAnimating(on);
      timer = setTimeout(() => {
        if (mounted) loop(!on);
      }, on ? ON_MS : OFF_MS);
    }
    loop(true);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  return <AnimatedCategoryIcon slug={slug} animating={animating} size={size} />;
}
