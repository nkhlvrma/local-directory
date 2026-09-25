"use client";

import { DAYS, DAY_LABEL, currentDayIn, formatDay } from "@/lib/hours";
import { useMinuteClock } from "@/lib/use-minute-clock";
import type { WeekHours } from "@/lib/types";

export function HoursTable({ hours }: { hours: WeekHours }) {
  // "Today" is the business's day in IST, resolved in the browser. Computing
  // it during render used the server's clock (UTC on Vercel — the wrong day
  // before 05:30 IST) and then cached it with the page for up to an hour.
  const today = useMinuteClock(() => currentDayIn().day);

  return (
    <div className="rounded-xl border border-border/70 overflow-hidden">
      {DAYS.map((d, i) => {
        const isToday = d === today;
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
