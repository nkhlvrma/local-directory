"use client";

import type { AnalyticsEventName } from "@/lib/analytics";

// Client-side counterpart to src/lib/analytics.ts — fire-and-forget POST to
// /api/track. Never throws, never awaited by callers; safe to call from any
// click handler or effect.
export function trackEvent(
  eventName: AnalyticsEventName,
  opts?: { listingId?: string | null; metadata?: Record<string, unknown> | null },
): void {
  try {
    const body = JSON.stringify({
      event_name: eventName,
      listing_id: opts?.listingId ?? null,
      metadata: opts?.metadata ?? null,
    });
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // storage/network blocked — silent no-op
  }
}
