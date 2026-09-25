"use client";

import { isOpenNow } from "@/lib/hours";
import type { WeekHours } from "@/lib/types";
import { useMinuteClock } from "@/lib/use-minute-clock";

// Resolved in the browser, not at render: the pages this sits on are cached
// for up to an hour, so a server-computed "Open" could be an hour stale. It
// renders nothing until hydrated, then re-checks every minute.
export function OpenNowBadge({ hours }: { hours: WeekHours | null }) {
  const open = useMinuteClock(() => isOpenNow(hours));

  if (open === null) return null;
  return open ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
      <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
      Open
    </span>
  ) : (
    <span className="text-xs text-muted-foreground">Closed</span>
  );
}
