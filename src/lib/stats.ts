// Pure aggregation for the admin stats page. Raw rows come in, counts come
// out — kept separate from the queries so the arithmetic is unit-testable.

export type EventRow = { event_name: string; listing_id: string | null };

export type ListingStats = {
  listingId: string;
  views: number;
  whatsapp: number;
  calls: number;
  /** WhatsApp + call taps: the leads we can show a business. */
  leads: number;
};

export type Totals = {
  views: number;
  whatsapp: number;
  calls: number;
  searches: number;
  submissions: number;
};

export function summarizeEvents(rows: EventRow[]): {
  totals: Totals;
  byListing: ListingStats[];
} {
  const totals: Totals = { views: 0, whatsapp: 0, calls: 0, searches: 0, submissions: 0 };
  const per = new Map<string, ListingStats>();
  const bump = (id: string | null, key: "views" | "whatsapp" | "calls") => {
    if (!id) return;
    const s = per.get(id) ?? { listingId: id, views: 0, whatsapp: 0, calls: 0, leads: 0 };
    s[key] += 1;
    if (key !== "views") s.leads += 1;
    per.set(id, s);
  };

  for (const r of rows) {
    switch (r.event_name) {
      case "listing_viewed":
        totals.views += 1;
        bump(r.listing_id, "views");
        break;
      case "whatsapp_clicked":
        totals.whatsapp += 1;
        bump(r.listing_id, "whatsapp");
        break;
      case "call_clicked":
        totals.calls += 1;
        bump(r.listing_id, "calls");
        break;
      case "search_submitted":
        totals.searches += 1;
        break;
      case "business_submission_completed":
        totals.submissions += 1;
        break;
    }
  }

  const byListing = [...per.values()].sort(
    (a, b) => b.leads - a.leads || b.views - a.views,
  );
  return { totals, byListing };
}

export type UnmetQuery = { query: string; count: number; lastSearched: string };

// Zero-result searches grouped case- and whitespace-insensitively, most
// searched first — what people wanted and couldn't find.
export function groupUnmetSearches(
  rows: { query: string; created_at: string }[],
): UnmetQuery[] {
  const groups = new Map<string, UnmetQuery>();
  for (const r of rows) {
    const key = r.query.trim().toLowerCase().replace(/\s+/g, " ");
    if (!key) continue;
    const g = groups.get(key);
    if (g) {
      g.count += 1;
      if (r.created_at > g.lastSearched) g.lastSearched = r.created_at;
    } else {
      groups.set(key, { query: key, count: 1, lastSearched: r.created_at });
    }
  }
  return [...groups.values()].sort(
    (a, b) => b.count - a.count || b.lastSearched.localeCompare(a.lastSearched),
  );
}
