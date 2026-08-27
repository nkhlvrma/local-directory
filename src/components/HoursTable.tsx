import { DAYS, DAY_LABEL, formatDay } from "@/lib/hours";
import type { WeekHours } from "@/lib/types";

export function HoursTable({ hours }: { hours: WeekHours }) {
  return (
    <div className="max-w-xs space-y-1">
      {DAYS.map((d) => (
        <div className="flex justify-between text-sm" key={d}>
          <span className="text-muted-foreground">{DAY_LABEL[d]}</span>
          <span className="tabular-nums">{formatDay(hours[d] ?? null)}</span>
        </div>
      ))}
    </div>
  );
}
