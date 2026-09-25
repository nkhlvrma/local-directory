import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { groupUnmetSearches, summarizeEvents, type EventRow } from "@/lib/stats";
import { AdminShell } from "../AdminShell";

export const dynamic = "force-dynamic";

const RANGES = [7, 30, 90] as const;
const PAGE = 1000; // PostgREST's default max rows per response
const MAX_ROWS = 50_000; // keeps a runaway table from stalling the page

const TRACKED_EVENTS = [
  "listing_viewed",
  "whatsapp_clicked",
  "call_clicked",
  "search_submitted",
  "business_submission_completed",
];

type Admin = ReturnType<typeof createSupabaseAdminClient>;

// Pages through a query built by `build`, since a single response is capped.
// Aggregating here rather than in SQL keeps this free of a migration; fine at
// this volume, and MAX_ROWS says so on the page if it's ever outgrown.
async function fetchAll<T>(
  build: (from: number, to: number) => PromiseLike<{ data: unknown; error: { message: string } | null }>,
): Promise<{ rows: T[]; error: string | null; truncated: boolean }> {
  const rows: T[] = [];
  for (let from = 0; from < MAX_ROWS; from += PAGE) {
    const { data, error } = await build(from, from + PAGE - 1);
    if (error) return { rows, error: error.message, truncated: false };
    const batch = (data ?? []) as T[];
    rows.push(...batch);
    if (batch.length < PAGE) return { rows, error: null, truncated: false };
  }
  return { rows, error: null, truncated: true };
}

// This page is dynamic (rendered per request), so "now" is the request time.
function startOfRange(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function Tile({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value.toLocaleString("en-IN")}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export default async function AdminStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const days = RANGES.find((d) => String(d) === sp.days) ?? 30;
  const since = startOfRange(days);
  const admin: Admin = createSupabaseAdminClient();

  const [events, unmet] = await Promise.all([
    fetchAll<EventRow>((from, to) =>
      admin
        .from("analytics_events")
        .select("event_name, listing_id")
        .in("event_name", TRACKED_EVENTS)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .range(from, to),
    ),
    fetchAll<{ query: string; created_at: string }>((from, to) =>
      admin
        .from("search_events")
        .select("query, created_at")
        .eq("matched_count", 0)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .range(from, to),
    ),
  ]);

  const { totals, byListing } = summarizeEvents(events.rows);
  const unmetQueries = groupUnmetSearches(unmet.rows).slice(0, 25);
  const topListings = byListing.slice(0, 25);

  const ids = topListings.map((l) => l.listingId);
  const { data: named } = ids.length
    ? await admin.from("listings").select("id, name, status").in("id", ids)
    : { data: [] };
  const names = new Map(
    ((named ?? []) as { id: string; name: string; status: string }[]).map((l) => [l.id, l]),
  );

  const errors = [events.error, unmet.error].filter(Boolean);
  const truncated = events.truncated || unmet.truncated;

  return (
    <AdminShell title="Admin Dashboard" description="What visitors did, and what they couldn't find.">
      <Container size="md" className="py-8 space-y-8">
        <nav className="flex gap-1.5" aria-label="Date range">
          {RANGES.map((d) => (
            <Button key={d} asChild size="sm" variant={d === days ? "default" : "outline"}>
              <Link href={d === 30 ? "/admin/stats" : `/admin/stats?days=${d}`}>Last {d} days</Link>
            </Button>
          ))}
        </nav>

        {errors.length ? (
          <p className="text-sm text-destructive">Some data failed to load: {errors.join("; ")}</p>
        ) : null}
        {truncated ? (
          <p className="text-sm text-muted-foreground">
            Showing the most recent {MAX_ROWS.toLocaleString("en-IN")} events only — this range
            needs a database-side summary.
          </p>
        ) : null}

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-5" aria-label="Totals">
          <Tile label="Listing views" value={totals.views} />
          <Tile label="WhatsApp taps" value={totals.whatsapp} />
          <Tile label="Call taps" value={totals.calls} />
          <Tile label="Searches" value={totals.searches} />
          <Tile label="New submissions" value={totals.submissions} />
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="font-semibold">Leads by listing</h2>
            <p className="text-sm text-muted-foreground">
              WhatsApp and call taps — the number to show a business when offering a featured
              spot.
            </p>
          </div>
          {topListings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No listing activity in this range.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="p-2.5 font-medium">Listing</th>
                    <th className="p-2.5 font-medium text-right">Views</th>
                    <th className="p-2.5 font-medium text-right">WhatsApp</th>
                    <th className="p-2.5 font-medium text-right">Calls</th>
                    <th className="p-2.5 font-medium text-right">Leads</th>
                  </tr>
                </thead>
                <tbody>
                  {topListings.map((l) => {
                    const listing = names.get(l.listingId);
                    return (
                      <tr key={l.listingId} className="border-b last:border-0">
                        <td className="p-2.5">
                          {listing ? (
                            <Link
                              href={`/admin/listings/${l.listingId}/edit`}
                              className="hover:underline underline-offset-4"
                            >
                              {listing.name}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">(deleted listing)</span>
                          )}
                        </td>
                        <td className="p-2.5 text-right tabular-nums">{l.views}</td>
                        <td className="p-2.5 text-right tabular-nums">{l.whatsapp}</td>
                        <td className="p-2.5 text-right tabular-nums">{l.calls}</td>
                        <td className="p-2.5 text-right tabular-nums font-medium">{l.leads}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="font-semibold">Searches with no results</h2>
            <p className="text-sm text-muted-foreground">
              Demand the directory isn&apos;t meeting yet — a to-do list for outreach.
            </p>
          </div>
          {unmetQueries.length === 0 ? (
            <p className="text-sm text-muted-foreground">None in this range.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="p-2.5 font-medium">Search</th>
                    <th className="p-2.5 font-medium text-right">Times</th>
                    <th className="p-2.5 font-medium text-right">Last searched</th>
                  </tr>
                </thead>
                <tbody>
                  {unmetQueries.map((q) => (
                    <tr key={q.query} className="border-b last:border-0">
                      <td className="p-2.5">{q.query}</td>
                      <td className="p-2.5 text-right tabular-nums">{q.count}</td>
                      <td className="p-2.5 text-right text-muted-foreground">
                        {new Date(q.lastSearched).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </Container>
    </AdminShell>
  );
}
