import { isOpenNow } from "@/lib/hours";
import type { WeekHours } from "@/lib/types";

export function OpenNowBadge({ hours }: { hours: WeekHours | null }) {
  const open = isOpenNow(hours);
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
