import { Container } from "@/components/ui/container";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CITY_SLUG } from "@/lib/site";
import { AdminNav } from "../AdminNav";
import { NeighborhoodForm } from "./NeighborhoodForm";

export const dynamic = "force-dynamic";

type Row = { id: string; name: string; slug: string };

export default async function AdminNeighborhoodsPage() {
  await requireAdmin();
  const admin = createSupabaseAdminClient();

  const { data: city } = await admin
    .from("cities")
    .select("id, name")
    .eq("slug", CITY_SLUG)
    .maybeSingle();

  const { data } = city
    ? await admin
        .from("neighborhoods")
        .select("id, name, slug")
        .eq("city_id", (city as { id: string }).id)
        .order("name")
    : { data: [] as Row[] };
  const neighborhoods = (data ?? []) as Row[];

  return (
    <Container size="md" className="py-10 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight font-heading">Admin</h1>
        <p className="text-muted-foreground text-sm">
          Manage neighborhoods for {(city as { name: string } | null)?.name ?? CITY_SLUG}.
        </p>
      </header>

      <AdminNav active="neighborhoods" />

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
  );
}
