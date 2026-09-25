import { describe, it, expect } from "vitest";
import { groupUnmetSearches, summarizeEvents } from "../stats";

describe("summarizeEvents", () => {
  it("totals events and ranks listings by leads, then views", () => {
    const { totals, byListing } = summarizeEvents([
      { event_name: "listing_viewed", listing_id: "a" },
      { event_name: "listing_viewed", listing_id: "a" },
      { event_name: "listing_viewed", listing_id: "b" },
      { event_name: "whatsapp_clicked", listing_id: "b" },
      { event_name: "call_clicked", listing_id: "b" },
      { event_name: "whatsapp_clicked", listing_id: null },
      { event_name: "search_submitted", listing_id: null },
      { event_name: "business_submission_completed", listing_id: null },
      { event_name: "share_clicked", listing_id: "a" },
    ]);
    expect(totals).toEqual({ views: 3, whatsapp: 2, calls: 1, searches: 1, submissions: 1 });
    expect(byListing).toEqual([
      { listingId: "b", views: 1, whatsapp: 1, calls: 1, leads: 2 },
      { listingId: "a", views: 2, whatsapp: 0, calls: 0, leads: 0 },
    ]);
  });
});

describe("groupUnmetSearches", () => {
  it("groups case- and whitespace-insensitively, most searched first", () => {
    const out = groupUnmetSearches([
      { query: "Biryani", created_at: "2026-09-01T10:00:00Z" },
      { query: " biryani ", created_at: "2026-09-03T10:00:00Z" },
      { query: "gym  trainer", created_at: "2026-09-02T10:00:00Z" },
      { query: "   ", created_at: "2026-09-02T10:00:00Z" },
    ]);
    expect(out).toEqual([
      { query: "biryani", count: 2, lastSearched: "2026-09-03T10:00:00Z" },
      { query: "gym trainer", count: 1, lastSearched: "2026-09-02T10:00:00Z" },
    ]);
  });
});
