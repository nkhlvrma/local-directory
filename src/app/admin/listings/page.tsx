import Link from "next/link";
import { Check, EyeOff, Pencil, Search, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ilikeAnyFilter } from "@/lib/postgrest";
import { cn } from "@/lib/utils";
import { AdminShell } from "../AdminShell";
import { DeleteListingButton } from "../DeleteListingButton";
import { approveListing, setVerified, unpublishListing } from "../actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

const STATUSES = [
  { value: "all", label: "All" },
  { value: "approved", label: "Live" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
  { value: "removed", label: "Unpublished" },
] as const;
type StatusFilter = (typeof STATUSES)[number]["value"];

const STATUS_BADGE: Record<string, string> = {
  approved: "Live",
  pending: "Pending",
  rejected: "Rejected",
  removed: "Unpublished",
};

type Row = {
  id: string;
  name: string;
  whatsapp_number: string;
  status: string;
  verified: boolean;
  whatsapp_clicks: number;
  categories: { name: string } | null;
  neighborhoods: { name: string } | null;
};

type SP = { status?: string; q?: string; page?: string };

// Every listing in any status, searchable and paged. The queue page only
// shows pending ones, so rejected and unpublished listings — and anything
// past the most recent handful — were otherwise unreachable.
export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const status: StatusFilter = STATUSES.some((s) => s.value === sp.status)
    ? (sp.status as StatusFilter)
    : "all";
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const admin = createSupabaseAdminClient();
  let query = admin
    .from("listings")
    .select(
      "id, name, whatsapp_number, status, verified, whatsapp_clicks, categories(name), neighborhoods(name)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (status !== "all") query = query.eq("status", status);
  if (q) query = query.or(ilikeAnyFilter(["name", "whatsapp_number"], q));
  const { data, count, error } = await query;

  const rows = (data ?? []) as unknown as Row[];
  const total = count ?? rows.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const href = (patch: Partial<SP>) => {
    const next = new URLSearchParams();
    const merged = { status, q, page: String(page), ...patch };
    if (merged.status && merged.status !== "all") next.set("status", merged.status);
    if (merged.q) next.set("q", merged.q);
    if (merged.page && merged.page !== "1") next.set("page", merged.page);
    const qs = next.toString();
    return qs ? `/admin/listings?${qs}` : "/admin/listings";
  };

  return (
    <AdminShell title="Admin Dashboard" description="Every listing, in any status.">
      <Container size="md" className="py-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="flex flex-wrap gap-1.5" aria-label="Filter by status">
            {STATUSES.map((s) => (
              <Button
                key={s.value}
                asChild
                size="sm"
                variant={s.value === status ? "default" : "outline"}
              >
                <Link href={href({ status: s.value, page: "1" })}>{s.label}</Link>
              </Button>
            ))}
          </nav>
          <form className="flex items-center gap-2" action="/admin/listings">
            {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
            <Input
              name="q"
              defaultValue={q}
              placeholder="Name or number"
              className="h-8 w-48"
              aria-label="Search listings"
            />
            <Button type="submit" size="sm" variant="outline" aria-label="Search">
              <Search className="size-4" />
            </Button>
          </form>
        </div>

        <p className="text-sm text-muted-foreground">
          {error ? `Couldn't load listings: ${error.message}` : `${total} listing${total === 1 ? "" : "s"}`}
        </p>

        <div className="space-y-2">
          {rows.map((l) => (
            <div
              key={l.id}
              className="border rounded-lg p-3 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-medium flex flex-wrap items-center gap-1.5">
                  {l.name}
                  <Badge
                    variant="outline"
                    className={cn(l.status === "approved" && "border-emerald-500/40 text-emerald-700 dark:text-emerald-400")}
                  >
                    {STATUS_BADGE[l.status] ?? l.status}
                  </Badge>
                  {l.verified ? (
                    <Badge variant="secondary" className="gap-1">
                      <ShieldCheck className="size-3" /> Verified
                    </Badge>
                  ) : null}
                </p>
                <p className="text-sm text-muted-foreground">
                  {l.categories?.name} · {l.neighborhoods?.name} · {l.whatsapp_number} ·{" "}
                  {l.whatsapp_clicks} WhatsApp click{l.whatsapp_clicks === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {l.status === "approved" ? (
                  <>
                    <form action={setVerified.bind(null, l.id, !l.verified)}>
                      <Button type="submit" size="sm" variant="outline">
                        <ShieldCheck className="size-4" />
                        {l.verified ? "Unverify" : "Verify"}
                      </Button>
                    </form>
                    <form action={unpublishListing.bind(null, l.id)}>
                      <Button type="submit" size="sm" variant="outline">
                        <EyeOff className="size-4" />
                        Unpublish
                      </Button>
                    </form>
                  </>
                ) : (
                  <form action={approveListing.bind(null, l.id)}>
                    <Button type="submit" size="sm">
                      <Check className="size-4" />
                      {l.status === "pending" ? "Approve" : "Publish"}
                    </Button>
                  </form>
                )}
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/listings/${l.id}/edit`} aria-label={`Edit ${l.name}`}>
                    <Pencil className="size-4" />
                    Edit
                  </Link>
                </Button>
                <DeleteListingButton listingId={l.id} listingName={l.name} />
              </div>
            </div>
          ))}
        </div>

        {pages > 1 ? (
          <nav className="flex items-center justify-between" aria-label="Pages">
            <Button asChild size="sm" variant="outline" disabled={page <= 1}>
              {page > 1 ? <Link href={href({ page: String(page - 1) })}>Previous</Link> : <span>Previous</span>}
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {pages}
            </span>
            <Button asChild size="sm" variant="outline" disabled={page >= pages}>
              {page < pages ? <Link href={href({ page: String(page + 1) })}>Next</Link> : <span>Next</span>}
            </Button>
          </nav>
        ) : null}
      </Container>
    </AdminShell>
  );
}
