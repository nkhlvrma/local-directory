"use client";

import { useSyncExternalStore } from "react";
import { ListingGridCard } from "@/components/ListingGridCard";
import type { RecentEntry } from "./TrackView";

const KEY = "recently-viewed-v1";

// useSyncExternalStore requires getSnapshot to return the SAME reference when
// the underlying data hasn't changed — otherwise React re-renders in a loop
// (React error #185). Cache the parsed value keyed on the raw string.
const EMPTY: RecentEntry[] = [];
let cachedRaw: string | null | undefined = undefined;
let cachedItems: RecentEntry[] = EMPTY;

function getClientSnapshot(): RecentEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === cachedRaw) return cachedItems;
    cachedRaw = raw;
    cachedItems = raw ? (JSON.parse(raw) as RecentEntry[]) : EMPTY;
    return cachedItems;
  } catch {
    return cachedItems;
  }
}

function getServerSnapshot(): RecentEntry[] {
  return EMPTY;
}

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("recently-viewed-change", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("recently-viewed-change", onStoreChange);
  };
}

export function RecentlyViewed() {
  const items = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (items.length === 0) return null;
  const shown = items.slice(0, 4);

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        Recently viewed
      </h2>
      {/* Same card as the search results and the category/neighborhood
          grids, so a listing looks identical wherever it turns up. */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {shown.map((r) => (
          <ListingGridCard
            key={r.id}
            id={r.id}
            href={r.href}
            name={r.name}
            categorySlug={r.categorySlug ?? ""}
            categoryIcon={r.categoryIcon}
            subtitle={`${r.category} · ${r.neighborhood}`}
            verified={r.verified}
            photo_url={r.photo_url}
          />
        ))}
      </div>
    </section>
  );
}
