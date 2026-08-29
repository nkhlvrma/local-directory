import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CITY_SLUG } from "@/lib/site";
import { AdminShell } from "../../../AdminShell";
import { EditListingSheet } from "./EditListingSheet";
import type { EditableListing } from "../../ListingForm";

export const dynamic = "force-dynamic";

export default async function AdminEditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const admin = createSupabaseAdminClient();

  // All three are independent — one round-trip wave rather than three
  // sequential ones, which matters given the cross-region hop.
  const [{ data: listing }, { data: categories }, { data: neighborhoods }] =
    await Promise.all([
      admin
        .from("listings")
        .select(
          "id, name, description, whatsapp_number, pin_code, category_id, neighborhood_id, verified, photo_url, cover_photo_url, gallery_urls",
        )
        .eq("id", id)
        .maybeSingle(),
      admin.from("categories").select("id, name").order("name"),
      admin
        .from("neighborhoods")
        .select("id, name, cities!inner(slug)")
        .eq("cities.slug", CITY_SLUG)
        .order("name"),
    ]);

  if (!listing) notFound();

  return (
    <AdminShell title="Admin Dashboard" description="Edit a listing.">
      <EditListingSheet
        listing={listing as unknown as EditableListing}
        categories={(categories ?? []) as { id: string; name: string }[]}
        neighborhoods={(neighborhoods ?? []) as { id: string; name: string }[]}
      />
    </AdminShell>
  );
}
