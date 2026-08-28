// Server-only helper (uses the service-role admin client) — import only
// from server components, server actions, or route handlers.
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Funnel event names — keep this list in sync with the product plan's
// "instrument the key funnel" deliverable. Using a union catches typos at
// the call site without forcing a rigid enum in the DB.
export type AnalyticsEventName =
  | "search_submitted"
  | "listing_card_click"
  | "listing_viewed"
  | "whatsapp_clicked"
  | "call_clicked"
  | "share_clicked"
  | "map_interacted"
  | "business_submission_started"
  | "business_submission_completed";

type LogEventOptions = {
  listingId?: string | null;
  metadata?: Record<string, unknown> | null;
};

// Server-only, fire-and-forget analytics logger. Never throws — a broken
// analytics insert (or missing Supabase project, i.e. demo mode) must never
// break the user-facing action it's attached to.
export async function logEvent(
  eventName: AnalyticsEventName,
  { listingId, metadata }: LogEventOptions = {},
): Promise<void> {
  try {
    const admin = createSupabaseAdminClient();
    await admin.from("analytics_events").insert({
      event_name: eventName,
      listing_id: listingId ?? null,
      metadata: metadata ?? null,
    });
  } catch {
    // Swallow — analytics must never break the request it's attached to.
  }
}
