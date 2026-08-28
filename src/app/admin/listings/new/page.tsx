import { Container } from "@/components/ui/container";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CITY_SLUG } from "@/lib/site";
import { AdminNav } from "../../AdminNav";
import { NewListingForm } from "./NewListingForm";

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
    <Container size="md" className="py-10 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight font-heading">Admin</h1>
        <p className="text-muted-foreground text-sm">
          Create a listing directly — publishes immediately unless you uncheck it.
        </p>
      </header>

      <AdminNav active="new-listing" />

      <NewListingForm
        categories={(categories ?? []) as { id: string; name: string }[]}
        neighborhoods={(neighborhoods ?? []) as { id: string; name: string }[]}
      />
    </Container>
  );
}
