import { Container } from "@/components/ui/container";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CITY_SLUG } from "@/lib/site";
import { AdminShell } from "../AdminShell";
import { NeighborhoodForm } from "./NeighborhoodForm";

export const dynamic = "force-dynamic";

type Row = { id: string; name: string; slug: string };

export default async function AdminNeighborhoodsPage() {
  await requireAdmin();
  const admin = createSupabaseAdminClient();

  // Independent queries — run concurrently instead of city-then-
  // neighborhoods. Matters more than usual given the cross-region latency
  // (Supabase ap-south-1, this runs on Vercel iad1) — each extra sequential
  // round trip adds up, and city-then-neighborhoods was forcing two even
  // though neither depends on the other's result (only on CITY_SLUG).
  const [{ data: city }, { data }] = await Promise.all([
    admin.from("cities").select("name").eq("slug", CITY_SLUG).maybeSingle(),
    admin
      .from("neighborhoods")
      .select("id, name, slug, cities!inner(slug)")
      .eq("cities.slug", CITY_SLUG)
      .order("name"),
  ]);
  const neighborhoods = (data ?? []) as Row[];
  const cityName = (city as { name: string } | null)?.name ?? CITY_SLUG;

  return (
    <AdminShell title="Admin Dashboard" description={`Manage neighborhoods for ${cityName}.`}>
    <Container size="md" className="py-8 space-y-8">
      <NeighborhoodForm />

      <section className="space-y-3">
        <h2 className="font-semibold">
          Neighborhoods{" "}
          <span className="text-muted-foreground font-normal">({neighborhoods.length})</span>
        </h2>
        <div className="space-y-2">
          {neighborhoods.map((n) => (
            <div key={n.id} className="border rounded-lg p-3">
              <p className="font-medium">{n.name}</p>
              <p className="text-sm text-muted-foreground">{n.slug}</p>
            </div>
          ))}
        </div>
      </section>
    </Container>
    </AdminShell>
  );
}
