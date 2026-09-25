"use client";

import { isOpenNow } from "./hours";
import type { ListingCardRow } from "./types";

// Browse-page filtering runs on the client so /[city]/c/[category] and
// /[city]/n/[neighborhood] can be statically rendered and served from the
// edge. Reading searchParams on the server would force
// every one of those requests through a Supabase round-trip — on the pages
// whose whole job is to rank in search.
//
// The server therefore renders the FULL listing set into the HTML (which is
// what a crawler sees), and this store narrows it after hydration. Filters
// are opt-in and rare, so the common case is already correct at first paint.

export type FilterKey = "verified" | "photo" | "open";

export type ListingFilters = {
  verified: boolean;
  photo: boolean;
  open: boolean;
};

export const NO_FILTERS: ListingFilters = {
  verified: false,
  photo: false,
  open: false,
};

const CHANGE_EVENT = "listing-filters-change";

// useSyncExternalStore requires getSnapshot to return the SAME reference when
// nothing changed, or React re-renders in a loop (React error #185). Cache on
// the only input — the query string.
let cachedKey: string | undefined;
let cached: ListingFilters = NO_FILTERS;

export function getFilterSnapshot(): ListingFilters {
  const search = window.location.search;
  if (search === cachedKey) return cached;

  const sp = new URLSearchParams(search);
  cachedKey = search;
  cached = {
    verified: sp.get("verified") === "1",
    photo: sp.get("photo") === "1",
    open: sp.get("open") === "1",
  };
  return cached;
}

// The server has no query string in a static render, so it
// always sees "no filters" — matching the full list it renders.
export function getServerFilterSnapshot(): ListingFilters {
  return NO_FILTERS;
}

export function subscribeFilters(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("popstate", onChange);
  };
}

// Flips one filter in the URL without a server round-trip. history.replaceState
// (rather than router.replace) keeps the cached RSC payload untouched, so
// toggling a filter is instant instead of re-fetching the page.
export function toggleFilter(key: FilterKey): void {
  const sp = new URLSearchParams(window.location.search);
  if (sp.get(key) === "1") sp.delete(key);
  else sp.set(key, "1");
  const qs = sp.toString();
  window.history.replaceState(
    null,
    "",
    qs ? `${window.location.pathname}?${qs}` : window.location.pathname,
  );
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function hasActiveFilters(f: ListingFilters): boolean {
  return f.verified || f.photo || f.open;
}

// Pure — exported separately so it can be unit-tested without a DOM.
export function applyFilters<T extends ListingCardRow>(
  rows: T[],
  f: ListingFilters,
): T[] {
  if (!hasActiveFilters(f)) return rows;
  return rows.filter(
    (r) =>
      (!f.verified || r.verified) &&
      (!f.photo || Boolean(r.photo_url)) &&
      (!f.open || isOpenNow(r.hours_json) === true),
  );
}
