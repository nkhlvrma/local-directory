import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CITY_SLUG } from "@/lib/site";
import { AdminShell } from "../../AdminShell";
import { NewListingSheet } from "./NewListingSheet";

export const dynamic = "force-dynamic";

export default async function AdminNewListingPage() {
  await requireAdmin();
  const admin = createSupabaseAdminClient();

  // Both independent of each other — no need for the city lookup this used
  // to do first (neighborhoods filtered by city slug via join instead), so
  // this is one round trip "wave" instead of two sequential ones. Matters
  // more than usual given the cross-region latency (Supabase ap-south-1,
  // this runs on Vercel iad1).
  const [{ data: categories }, { data: neighborhoods }] = await Promise.all([
    admin.from("categories").select("id, name").order("name"),
    admin
      .from("neighborhoods")
      .select("id, name, cities!inner(slug)")
      .eq("cities.slug", CITY_SLUG)
      .order("name"),
  ]);

  return (
    <AdminShell title="Admin Dashboard" description="Create a listing directly.">
      <NewListingSheet
        categories={(categories ?? []) as { id: string; name: string }[]}
        neighborhoods={(neighborhoods ?? []) as { id: string; name: string }[]}
      />
    </AdminShell>
  );
}
