"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DAYS, DAY_LABEL, type Day } from "@/lib/hours";
import type { WeekHours } from "@/lib/types";

type DayState = { open: boolean; from: string; to: string };

const DEFAULT_DAY: DayState = { open: true, from: "09:00", to: "20:00" };

function toState(hours: WeekHours | null): Record<Day, DayState> {
  return Object.fromEntries(
    DAYS.map((d) => {
      const h = hours?.[d];
      if (hours === null) return [d, d === "sun" ? { ...DEFAULT_DAY, open: false } : DEFAULT_DAY];
      return [d, h ? { open: true, from: h.open, to: h.close } : { ...DEFAULT_DAY, open: false }];
    }),
  ) as Record<Day, DayState>;
}

function toHours(days: Record<Day, DayState>): WeekHours {
  return Object.fromEntries(
    DAYS.map((d) => [d, days[d].open ? { open: days[d].from, close: days[d].to } : null]),
  ) as WeekHours;
}

// Weekly opening hours, submitted as one JSON field (hours_json) that the
// server validates with parseHoursInput. "Not set" submits an empty value and
// stores null — the listing then shows no hours and never matches "Open now",
// which is different from a week of closed days.
export function HoursEditor({ initial }: { initial: WeekHours | null }) {
  const [enabled, setEnabled] = useState(initial !== null);
  const [days, setDays] = useState(() => toState(initial));

  const set = (d: Day, patch: Partial<DayState>) =>
    setDays((prev) => ({ ...prev, [d]: { ...prev[d], ...patch } }));

  const copyMondayToOpenDays = () =>
    setDays((prev) =>
      Object.fromEntries(
        DAYS.map((d) => [d, prev[d].open ? { ...prev[d], from: prev.mon.from, to: prev.mon.to } : prev[d]]),
      ) as Record<Day, DayState>,
    );

  return (
    <div className="space-y-3">
      <input type="hidden" name="hours_json" value={enabled ? JSON.stringify(toHours(days)) : ""} />
      <div className="flex items-center gap-2.5">
        <Switch id="hours-enabled" checked={enabled} onCheckedChange={setEnabled} />
        <Label htmlFor="hours-enabled" className="font-normal">
          Opening hours
        </Label>
        {enabled ? null : (
          <span className="text-xs text-muted-foreground">Not set — hidden on the listing</span>
        )}
      </div>

      {enabled ? (
        <div className="space-y-2 rounded-lg border p-3">
          {DAYS.map((d) => (
            <div key={d} className="flex items-center gap-2.5">
              <Switch
                size="sm"
                checked={days[d].open}
                onCheckedChange={(open) => set(d, { open })}
                aria-label={`Open on ${DAY_LABEL[d]}`}
              />
              <span className="w-9 text-sm font-medium">{DAY_LABEL[d]}</span>
              {days[d].open ? (
                <>
                  <Input
                    type="time"
                    className="h-8 min-w-0 flex-1"
                    value={days[d].from}
                    onChange={(e) => set(d, { from: e.target.value })}
                    aria-label={`${DAY_LABEL[d]} opens`}
                    required
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input
                    type="time"
                    className="h-8 min-w-0 flex-1"
                    value={days[d].to}
                    onChange={(e) => set(d, { to: e.target.value })}
                    aria-label={`${DAY_LABEL[d]} closes`}
                    required
                  />
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Closed</span>
              )}
            </div>
          ))}
          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-xs text-muted-foreground">
              A closing time earlier than the opening time runs past midnight.
            </p>
            <Button type="button" size="sm" variant="outline" onClick={copyMondayToOpenDays}>
              Copy Mon to open days
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
