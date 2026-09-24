"use client";

import { useEffect, useState } from "react";

// The share and call buttons animate their icons on hover, via Motion
// (~41 KB gzipped). On the listing page — the one that carries the long-tail
// search traffic — that was loaded before first paint for an effect that
// only exists once a pointer is on the button.
//
// This fetches them once the browser is idle instead. Until they arrive the
// buttons render the equivalent static Lucide glyph, so the page is complete
// and clickable either way; the handle refs stay null and the hover handlers
// no-op through optional chaining.

type ContactIcons = typeof import("./contact-icons-animated");

let cached: ContactIcons | null = null;

export function useContactIcons(): ContactIcons | null {
  const [icons, setIcons] = useState<ContactIcons | null>(cached);

  useEffect(() => {
    if (icons) return;
    let active = true;
    const load = () =>
      void import("./contact-icons-animated").then((mod) => {
        cached = mod;
        if (active) setIcons(mod);
      });

    // Idle so it never competes with hydration; the timeout keeps it from
    // being postponed indefinitely on a busy page. Effects only run in the
    // browser, so `window` is always there — but Safari lacked
    // requestIdleCallback until recently, hence the setTimeout path.
    const canIdle = "requestIdleCallback" in window;
    const handle = canIdle
      ? window.requestIdleCallback(load, { timeout: 2_000 })
      : window.setTimeout(load, 300);

    return () => {
      active = false;
      if (canIdle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, [icons]);

  return icons;
}
