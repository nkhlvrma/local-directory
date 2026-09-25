import { describe, it, expect, afterEach, vi } from "vitest";
import { applyFilters, hasActiveFilters, NO_FILTERS } from "../listing-filters";
import type { ListingCardRow } from "../types";

// applyFilters is what the browse pages now rely on for correctness — the
// server sends every approved listing and this decides what a visitor sees.
function row(over: Partial<ListingCardRow> = {}): ListingCardRow {
  return {
    id: crypto.randomUUID(),
    name: "Test",
    slug: "test",
    description: null,
    verified: false,
    pin_code: null,
    photo_url: null,
    hours_json: null,
    ...over,
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("hasActiveFilters", () => {
  it("is false for the default snapshot", () => {
    expect(hasActiveFilters(NO_FILTERS)).toBe(false);
  });

  it("is true when only one filter is set", () => {
    expect(hasActiveFilters({ ...NO_FILTERS, verified: true })).toBe(true);
  });
});

describe("applyFilters", () => {
  it("returns the same array reference when nothing is filtered", () => {
    // Cheap identity check keeps the no-filter render (the common case, and
    // the one crawlers see) allocation-free.
    const rows = [row(), row()];
    expect(applyFilters(rows, NO_FILTERS)).toBe(rows);
  });

  it("filters by verified", () => {
    const rows = [row({ verified: true }), row({ verified: false })];
    expect(applyFilters(rows, { ...NO_FILTERS, verified: true })).toHaveLength(1);
  });

  it("filters by photo presence, treating empty string as no photo", () => {
    const rows = [row({ photo_url: "https://x/y.jpg" }), row({ photo_url: "" })];
    expect(applyFilters(rows, { ...NO_FILTERS, photo: true })).toHaveLength(1);
  });

  it("filters by open-now, excluding listings with unknown hours", () => {
    // Monday 12:00 IST.
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2024, 0, 1, 6, 30)));
    const open = row({ hours_json: { mon: { open: "09:00", close: "18:00" } } });
    const shut = row({ hours_json: { mon: { open: "18:00", close: "20:00" } } });
    const unknown = row({ hours_json: null });
    const out = applyFilters([open, shut, unknown], { ...NO_FILTERS, open: true });
    expect(out).toEqual([open]);
  });

  it("ANDs multiple filters", () => {
    const match = row({ verified: true, photo_url: "u" });
    const rows = [
      match,
      row({ verified: false, photo_url: "u" }),
      row({ verified: true, photo_url: null }),
    ];
    const out = applyFilters(rows, {
      verified: true,
      photo: true,
      open: false,
    });
    expect(out).toEqual([match]);
  });
});
