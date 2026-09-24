import { NextResponse } from "next/server";
import { after } from "next/server";
import { createSupabaseStaticClient } from "@/lib/supabase/server";
import { logEvent } from "@/lib/analytics";

// GET /api/call/[id] — mirrors /api/wa/[id]: logs a "call_clicked" analytics
// event, then 302-redirects to tel:. Small businesses in Dehradun mostly use
// one number for both WhatsApp and calls, so this reuses whatsapp_number —
// no separate phone field needed.
//
// Reads with the anon client: "public read approved listings" RLS already
// exposes exactly this row, so there's no reason to reach for service-role.
// The event is logged in after() so a tap-to-call never waits on an insert.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = createSupabaseStaticClient();
  const { data } = await supabase
    .from("listings")
    .select("whatsapp_number, status")
    .eq("id", id)
    .maybeSingle();

  const listing = data as { whatsapp_number: string; status: string } | null;

  if (!listing || listing.status !== "approved") {
    return NextResponse.redirect(new URL("/", _req.url));
  }

  after(() => logEvent("call_clicked", { listingId: id }));

  return NextResponse.redirect(`tel:${listing.whatsapp_number}`, { status: 302 });
}
