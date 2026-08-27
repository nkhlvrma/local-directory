import { DAYS, DAY_LABEL, formatDay } from "@/lib/hours";
import type { WeekHours } from "@/lib/types";

// Day index: 0 = Sunday … 6 = Saturday. DAYS array uses 3-letter keys.
const DAY_TO_INDEX: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};

export function HoursTable({ hours }: { hours: WeekHours }) {
  // We resolve today's day in a way that works server-side (no window).
  // getDay() returns 0–6 starting Sunday, matching DAY_TO_INDEX above.
  const todayIndex =
    typeof Date !== "undefined" ? new Date().getDay() : -1;

  return (
    <div className="rounded-xl border border-border/70 overflow-hidden">
      {DAYS.map((d, i) => {
        const isToday = DAY_TO_INDEX[d] === todayIndex;
        return (
          <div
            key={d}
            className={`flex justify-between items-center px-4 py-2.5 text-sm ${
              i < DAYS.length - 1 ? "border-b border-border/50" : ""
            } ${isToday ? "bg-primary/5" : ""}`}
          >
            <span
              className={`font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}
            >
              {DAY_LABEL[d]}
              {isToday ? (
                <span className="ml-1.5 text-xs font-normal opacity-70">today</span>
              ) : null}
            </span>
            <span className="tabular-nums font-medium">{formatDay(hours[d] ?? null)}</span>
          </div>
        );
      })}
    </div>
  );
}
