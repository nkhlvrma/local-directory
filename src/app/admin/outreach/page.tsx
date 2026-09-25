import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CITY_SLUG, SITE_NAME } from "@/lib/site";
import { AdminShell } from "../AdminShell";
import { OutreachForm } from "./OutreachForm";
import { OutreachRow, STATUS_LABEL, type Lead } from "./OutreachRow";

export const dynamic = "force-dynamic";

const TABS = ["lead", "contacted", "yes", "no", "no_response"] as const;

export default async function AdminOutreachPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const status = TABS.includes(sp.status as (typeof TABS)[number]) ? sp.status! : "lead";

  const admin = createSupabaseAdminClient();
  const [{ data: leads, error }, { data: all }, { data: city }, { data: categories }, { data: neighborhoods }] =
    await Promise.all([
      admin
        .from("outreach_leads")
        .select(
          "id, business_name, whatsapp_number, status, source_note, contacted_at, listing_id, category_id, neighborhood_id, categories(name), neighborhoods(name)",
        )
        .eq("status", status)
        .order("created_at", { ascending: false })
        .limit(200),
      // Status only, for the tab counts.
      admin.from("outreach_leads").select("status"),
      admin.from("cities").select("name").eq("slug", CITY_SLUG).maybeSingle(),
      admin.from("categories").select("id, name").order("name"),
      admin
        .from("neighborhoods")
        .select("id, name, cities!inner(slug)")
        .eq("cities.slug", CITY_SLUG)
        .order("name"),
    ]);

  const counts: Record<string, number> = {};
  for (const r of (all ?? []) as { status: string }[]) counts[r.status] = (counts[r.status] ?? 0) + 1;
  const categoryOptions = (categories ?? []) as { id: string; name: string }[];
  const neighborhoodOptions = (neighborhoods ?? []) as { id: string; name: string }[];
  const cityName = (city as { name: string } | null)?.name ?? CITY_SLUG;

  return (
    <AdminShell
      title="Admin Dashboard"
      description="Businesses to invite. A yes becomes a pending listing."
    >
      <Container size="md" className="py-8 space-y-6">
        <OutreachForm categories={categoryOptions} neighborhoods={neighborhoodOptions} />

        <nav className="flex flex-wrap gap-1.5" aria-label="Filter by status">
          {TABS.map((t) => (
            <Button key={t} asChild size="sm" variant={t === status ? "default" : "outline"}>
              <Link href={t === "lead" ? "/admin/outreach" : `/admin/outreach?status=${t}`}>
                {STATUS_LABEL[t]} ({counts[t] ?? 0})
              </Link>
            </Button>
          ))}
        </nav>

        {error ? (
          <p className="text-sm text-destructive">Couldn&apos;t load leads: {error.message}</p>
        ) : (leads ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing here.</p>
        ) : (
          <div className="space-y-2">
            {((leads ?? []) as unknown as Lead[]).map((lead) => (
              <OutreachRow
                key={lead.id}
                lead={lead}
                categories={categoryOptions}
                neighborhoods={neighborhoodOptions}
                siteName={SITE_NAME}
                cityName={cityName}
              />
            ))}
          </div>
        )}
      </Container>
    </AdminShell>
  );
}
