import { Badge } from "@radix-ui/themes";
import { isOpenNow } from "@/lib/hours";
import type { WeekHours } from "@/lib/types";

// Server-rendered badge. Recomputes per-request in Asia/Kolkata.
export function OpenNowBadge({ hours }: { hours: WeekHours | null }) {
  const open = isOpenNow(hours);
  if (open === null) return null;
  return open ? (
    <Badge color="grass" variant="soft" size="1">
      Open now
    </Badge>
  ) : (
    <Badge color="gray" variant="soft" size="1">
      Closed
    </Badge>
  );
}
