import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AdminNav } from "./AdminNav";
import { approveListing, rejectListing, setVerified } from "./actions";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  name: string;
  whatsapp_number: string;
  description: string | null;
  created_at: string;
  verified: boolean;
  status: string;
  categories: { name: string } | null;
  neighborhoods: { name: string } | null;
};

export default async function AdminQueuePage() {
  await requireAdmin();
  const admin = createSupabaseAdminClient();

  // Independent queries — run concurrently rather than one-after-another.
  // Matters more than usual here since Supabase (ap-south-1) is a long way
  // from wherever this runs, and every extra sequential round trip adds up.
  const [{ data: pending }, { data: approved }] = await Promise.all([
    admin
      .from("listings")
      .select(
        "id, name, whatsapp_number, description, created_at, verified, status, categories(name), neighborhoods(name)",
      )
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    admin
      .from("listings")
      .select(
        "id, name, whatsapp_number, description, created_at, verified, status, categories(name), neighborhoods(name)",
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const pendingRows = (pending ?? []) as unknown as Row[];
  const approvedRows = (approved ?? []) as unknown as Row[];

  return (
    <Container size="md" className="py-10 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight font-heading">Admin</h1>
        <p className="text-muted-foreground text-sm">
          Review submissions and manage verification.
        </p>
      </header>

      <AdminNav active="queue" />

      <section className="space-y-3">
        <h2 className="font-semibold">
          Pending review{" "}
          <span className="text-muted-foreground font-normal">({pendingRows.length})</span>
        </h2>
        {pendingRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing waiting — you&apos;re caught up.</p>
        ) : (
          <div className="space-y-2">
            {pendingRows.map((l) => (
              <div key={l.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="font-medium">{l.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {l.categories?.name} · {l.neighborhoods?.name} · {l.whatsapp_number}
                    </p>
                    {l.description ? (
                      <p className="text-sm text-foreground/80">{l.description}</p>
                    ) : null}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <form action={approveListing.bind(null, l.id)}>
                      <Button type="submit" size="sm">
                        <Check className="size-4" />
                        Approve
                      </Button>
                    </form>
                    <form action={rejectListing.bind(null, l.id)}>
                      <Button type="submit" size="sm" variant="outline">
                        <X className="size-4" />
                        Reject
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">
          Approved listings{" "}
          <span className="text-muted-foreground font-normal">
            (most recent {approvedRows.length})
          </span>
        </h2>
        <div className="space-y-2">
          {approvedRows.map((l) => (
            <div key={l.id} className="border rounded-lg p-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium truncate flex items-center gap-1.5">
                  {l.name}
                  {l.verified ? (
                    <Badge variant="secondary" className="gap-1">
                      <ShieldCheck className="size-3" /> Verified
                    </Badge>
                  ) : null}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {l.categories?.name} · {l.neighborhoods?.name}
                </p>
              </div>
              <form action={setVerified.bind(null, l.id, !l.verified)} className="shrink-0">
                <Button type="submit" size="sm" variant={l.verified ? "outline" : "default"}>
                  <ShieldCheck className="size-4" />
                  {l.verified ? "Unverify" : "Mark verified"}
                </Button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </Container>
  );
}
