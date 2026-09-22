import { NextResponse } from "next/server";
import { after } from "next/server";
import { logEvent, isAnalyticsEventName } from "@/lib/analytics";
import { clientKey, isSameOrigin, rateLimit } from "@/lib/rate-limit";

// POST /api/track — thin endpoint client components hit to log a funnel
// event (card clicks, share, map interaction, submission start/complete…).
// Always returns 204, even on a rejected payload, since analytics must never
// surface an error to the user — and a 204 tells a probing client nothing.
//
// This writes to the database with service-role credentials on behalf of an
// anonymous caller, so it validates rather than trusts: same-origin only,
// rate limited per IP, event name checked against the known set, and metadata
// capped in size. Without these it was an open, unmetered INSERT endpoint.

const MAX_BODY_BYTES = 4_096;
const MAX_METADATA_KEYS = 20;
const WINDOW_MS = 60_000;
const MAX_EVENTS_PER_WINDOW = 60;

const NO_CONTENT = () => new NextResponse(null, { status: 204 });

function isUuid(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
  );
}

// Only plain JSON scalars, and only a bounded number of keys — this value goes
// into a jsonb column, so nesting an arbitrarily deep object is a free way to
// bloat the table.
function sanitizeMetadata(input: unknown): Record<string, unknown> | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const out: Record<string, unknown> = {};
  let n = 0;
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (n >= MAX_METADATA_KEYS) break;
    if (v === null || ["string", "number", "boolean"].includes(typeof v)) {
      out[k.slice(0, 64)] = typeof v === "string" ? v.slice(0, 500) : v;
      n += 1;
    }
  }
  return n > 0 ? out : null;
}

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return NO_CONTENT();

  const { ok } = rateLimit(clientKey(req, "track"), {
    limit: MAX_EVENTS_PER_WINDOW,
    windowMs: WINDOW_MS,
  });
  if (!ok) return NO_CONTENT();

  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return NO_CONTENT();

    const body = JSON.parse(raw) as Record<string, unknown>;
    const eventName = body?.event_name;
    if (!isAnalyticsEventName(eventName)) return NO_CONTENT();

    const listingId = isUuid(body?.listing_id) ? body.listing_id : null;
    const metadata = sanitizeMetadata(body?.metadata);

    after(() => logEvent(eventName, { listingId, metadata }));
  } catch {
    // ignore malformed payloads
  }
  return NO_CONTENT();
}
