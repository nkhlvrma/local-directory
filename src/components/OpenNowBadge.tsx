import { Badge } from "@/components/ui/badge";
import { isOpenNow } from "@/lib/hours";
import type { WeekHours } from "@/lib/types";

export function OpenNowBadge({ hours }: { hours: WeekHours | null }) {
  const open = isOpenNow(hours);
  if (open === null) return null;
  return open ? (
    <Badge
      variant="secondary"
      className="bg-green-100 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-900"
    >
      Open now
    </Badge>
  ) : (
    <Badge variant="secondary">Closed</Badge>
  );
}
