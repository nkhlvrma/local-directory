import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { AdminShell } from "./AdminShell";
import { DeleteListingButton } from "./DeleteListingButton";
import { approveListing, rejectListing } from "./actions";

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

  const { data: pending } = await admin
    .from("listings")
    .select(
      "id, name, whatsapp_number, description, created_at, verified, status, categories(name), neighborhoods(name)",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const pendingRows = (pending ?? []) as unknown as Row[];

  return (
    <AdminShell title="Admin Dashboard" description="Review submissions and manage verification.">
    <Container size="md" className="py-8 space-y-8">
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
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/listings/${l.id}/edit`} aria-label={`Edit ${l.name}`}>
                        <Pencil className="size-4" />
                        Edit
                      </Link>
                    </Button>
                    <DeleteListingButton listingId={l.id} listingName={l.name} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-sm text-muted-foreground">
        Live, rejected and unpublished listings are in{" "}
        <Link href="/admin/listings" className="underline underline-offset-4 hover:text-foreground">
          All listings
        </Link>
        .
      </p>
    </Container>
    </AdminShell>
  );
}
