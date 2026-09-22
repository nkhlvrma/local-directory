"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Image as ImageIcon, Clock, X } from "lucide-react";
import {
  getFilterSnapshot,
  getServerFilterSnapshot,
  subscribeFilters,
  toggleFilter,
  type FilterKey,
  type ListingFilters,
} from "@/lib/listing-filters";

export function CategoryFilterBar() {
  // Deliberately not useSearchParams(): that hook opts a statically rendered
  // route out of prerendering, which is exactly what these pages need to keep.
  // The shared store reads the same query string without the bailout.
  const filters = useSyncExternalStore(
    subscribeFilters,
    getFilterSnapshot,
    getServerFilterSnapshot,
  );

  // Pills, not plain buttons: the `outline` variant leaves the base
  // `border-transparent` in place, so an inactive chip used to read as a bare
  // white box. Each state gets an explicit edge — a visible border when off, a
  // filled surface plus a clear-X when on — so it's obvious these toggle.
  const chip = (
    key: FilterKey,
    label: string,
    Icon: React.ComponentType<{ className?: string }>,
  ) => {
    const active = filters[key as keyof ListingFilters] === true;
    return (
      <Button
        size="sm"
        variant={active ? "default" : "outline"}
        onClick={() => toggleFilter(key)}
        className={
          active
            ? "h-9 rounded-full border-primary px-3.5 shadow-xs"
            : "h-9 rounded-full border-border px-3.5 text-foreground/80 hover:border-foreground/25 hover:text-foreground"
        }
        aria-pressed={active}
        title={active ? `Remove "${label}" filter` : label}
      >
        {active ? (
          <X className="size-3.5" />
        ) : (
          <Icon className="size-3.5 opacity-60" />
        )}
        {label}
      </Button>
    );
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {chip("verified", "Verified only", CheckCircle2)}
      {chip("photo", "Has photo", ImageIcon)}
      {chip("open", "Open now", Clock)}
    </div>
  );
}
