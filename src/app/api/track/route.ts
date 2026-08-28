import { NextResponse } from "next/server";
import { logEvent, type AnalyticsEventName } from "@/lib/analytics";

// POST /api/track — thin endpoint client components hit to log a funnel
// event (card clicks, share, map interaction, submission start/complete…).
// Always returns 204, even on a bad payload, since analytics must never
// surface an error to the user.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const eventName = body?.event_name as AnalyticsEventName | undefined;
    if (eventName) {
      await logEvent(eventName, {
        listingId: body?.listing_id ?? null,
        metadata: body?.metadata ?? null,
      });
    }
  } catch {
    // ignore malformed payloads
  }
  return new NextResponse(null, { status: 204 });
}
