import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logEvent } from "@/lib/analytics";

// GET /api/call/[id] — mirrors /api/wa/[id]: logs a "call_clicked" analytics
// event, then 302-redirects to tel:. Small businesses in Lucknow mostly use
// one number for both WhatsApp and calls, so this reuses whatsapp_number —
// no separate phone field needed.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("listings")
    .select("whatsapp_number, status")
    .eq("id", id)
    .maybeSingle();

  const listing = data as { whatsapp_number: string; status: string } | null;

  if (!listing || listing.status !== "approved") {
    return NextResponse.redirect(new URL("/", _req.url));
  }

  await logEvent("call_clicked", { listingId: id });

  return NextResponse.redirect(`tel:${listing.whatsapp_number}`, { status: 302 });
}
