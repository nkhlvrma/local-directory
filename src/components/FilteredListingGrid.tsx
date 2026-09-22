"use client";

import { useSyncExternalStore } from "react";
import { ListingGridCard } from "./ListingGridCard";
import { EmptyResults } from "./EmptyResults";
import {
  applyFilters,
  getFilterSnapshot,
  getServerFilterSnapshot,
  hasActiveFilters,
  subscribeFilters,
} from "@/lib/listing-filters";
import type { ListingCardRow } from "@/lib/types";

// Everything a card needs, resolved on the server so this component stays a
// dumb renderer — the href and category art differ per page (category pages
// know the category, neighborhood pages know it per row).
export type GridItem = ListingCardRow & {
  href: string;
  categorySlug: string;
  categoryIcon: string | null;
  subtitle: string | null;
};

type Props = {
  items: GridItem[];
  /** Shown when the page genuinely has no listings. */
  emptyHeading: string;
  /** Shown when filters hid everything. */
  filteredHeading: string;
  suggestions?: { name: string; href: string }[];
};

// Renders the full server-provided set, then narrows it to the active filters
// after hydration. See lib/listing-filters for why filtering lives here.
export function FilteredListingGrid({
  items,
  emptyHeading,
  filteredHeading,
  suggestions = [],
}: Props) {
  const filters = useSyncExternalStore(
    subscribeFilters,
    getFilterSnapshot,
    getServerFilterSnapshot,
  );
  const rows = applyFilters(items, filters);

  if (rows.length === 0) {
    return (
      <EmptyResults
        heading={hasActiveFilters(filters) ? filteredHeading : emptyHeading}
        suggestions={suggestions}
      />
    );
  }

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {rows.map((l) => (
        <ListingGridCard
          key={l.id}
          id={l.id}
          href={l.href}
          name={l.name}
          categorySlug={l.categorySlug}
          categoryIcon={l.categoryIcon}
          subtitle={l.subtitle}
          description={l.description}
          photo_url={l.photo_url}
          hours={l.hours_json}
        />
      ))}
    </div>
  );
}
