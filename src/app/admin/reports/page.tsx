import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AdminNav } from "../AdminNav";
import { dismissReport } from "../actions";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  reason: string;
  note: string | null;
  created_at: string;
  listing_id: string;
  listings: { name: string; slug: string } | null;
};

export default async function AdminReportsPage() {
  await requireAdmin();
  const admin = createSupabaseAdminClient();

  const { data } = await admin
    .from("listing_reports")
    .select("id, reason, note, created_at, listing_id, listings(name, slug)")
    .order("created_at", { ascending: false });

  const reports = (data ?? []) as unknown as Row[];

  return (
    <Container size="md" className="py-10 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight font-heading">Admin</h1>
        <p className="text-muted-foreground text-sm">Review submissions and manage verification.</p>
      </header>

      <AdminNav active="reports" />

      <section className="space-y-3">
        <h2 className="font-semibold">
          Reports <span className="text-muted-foreground font-normal">({reports.length})</span>
        </h2>
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open reports.</p>
        ) : (
          <div className="space-y-2">
            {reports.map((r) => (
              <div key={r.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="font-medium">
                      {r.listings?.name ?? "(listing removed)"} — {r.reason}
                    </p>
                    {r.note ? (
                      <p className="text-sm text-foreground/80">{r.note}</p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <form action={dismissReport.bind(null, r.id)}>
                      <Button type="submit" size="sm" variant="ghost">
                        <Trash2 className="size-4" />
                        Dismiss
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Container>
  );
}
