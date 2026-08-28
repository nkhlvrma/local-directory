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

  const { data: city } = await admin
    .from("cities")
    .select("id")
    .eq("slug", CITY_SLUG)
    .maybeSingle();

  const [{ data: categories }, { data: neighborhoods }] = await Promise.all([
    admin.from("categories").select("id, name").order("name"),
    city
      ? admin
          .from("neighborhoods")
          .select("id, name")
          .eq("city_id", (city as { id: string }).id)
          .order("name")
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
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
