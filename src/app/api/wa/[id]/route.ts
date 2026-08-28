import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { whatsappLink, defaultOpener } from "@/lib/whatsapp";
import { SITE_NAME } from "@/lib/site";
import { isMockMode } from "@/lib/supabase/mock";
import { logEvent } from "@/lib/analytics";

// GET /api/wa/[id] — logs a click for tracking, then 302-redirects to the
// listing's wa.me link. The WhatsApp CTA on every listing page points here
// rather than directly at wa.me so we can prove leads to businesses.

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("listings")
    .select("name, whatsapp_number, status")
    .eq("id", id)
    .maybeSingle();

  const listing = data as
    | { name: string; whatsapp_number: string; status: string }
    | null;

  if (!listing || listing.status !== "approved") {
    return NextResponse.redirect(new URL("/", _req.url));
  }

  if (!isMockMode()) {
    // Fire-and-forget increment. Failure here shouldn't block the redirect.
    await admin.rpc("increment_whatsapp_click", { p_listing_id: id });
  }
  await logEvent("whatsapp_clicked", { listingId: id });

  const target = whatsappLink(
    listing.whatsapp_number,
    defaultOpener(listing.name, SITE_NAME),
  );
  return NextResponse.redirect(target, { status: 302 });
}
