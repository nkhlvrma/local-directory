import type { WeekHours, DayHours } from "./types";

export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Day = (typeof DAYS)[number];

export const DAY_LABEL: Record<Day, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export const BUSINESS_TIME_ZONE = "Asia/Kolkata";

// Today's day key and minutes past midnight in `zone` — the business's local
// time, whatever the server's or visitor's clock says.
export function currentDayIn(zone = BUSINESS_TIME_ZONE): { day: Day; minutes: number } {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    // h23, not hour12:false — some ICU versions render midnight as "24",
    // which would put 00:xx outside every day's window.
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(now).map((p) => [p.type, p.value]),
  );
  const dow = parts.weekday.slice(0, 3).toLowerCase() as Day;
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  return { day: dow, minutes };
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function isOpenNow(
  hours: WeekHours | null,
  zone = BUSINESS_TIME_ZONE,
): boolean | null {
  if (!hours) return null;
  const { day, minutes } = currentDayIn(zone);
  const today = hours[day];
  if (!today) return false;
  const openM = toMinutes(today.open);
  const closeM = toMinutes(today.close);
  // Handle windows that cross midnight (e.g. 22:00–02:00).
  if (closeM <= openM) {
    return minutes >= openM || minutes < closeM;
  }
  return minutes >= openM && minutes < closeM;
}

export function formatDay(h: DayHours): string {
  if (!h) return "Closed";
  return `${h.open}–${h.close}`;
}

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

// Validates the hours editor's JSON payload. An empty string means "hours not
// set" (null), which the public page shows as no hours at all — distinct from
// a week where every day is closed. Days missing from the object read as
// closed, same as isOpenNow treats them.
export function parseHoursInput(
  raw: string,
): { hours: WeekHours | null; error?: undefined } | { hours?: undefined; error: string } {
  if (!raw.trim()) return { hours: null };
  let input: unknown;
  try {
    input = JSON.parse(raw);
  } catch {
    return { error: "Hours couldn't be read — reload and try again." };
  }
  if (!input || typeof input !== "object" || Array.isArray(input))
    return { error: "Hours couldn't be read — reload and try again." };

  const hours: WeekHours = {};
  for (const day of DAYS) {
    const d = (input as Record<string, unknown>)[day];
    if (d === undefined || d === null) {
      hours[day] = null;
      continue;
    }
    const { open, close } = d as { open?: unknown; close?: unknown };
    if (typeof open !== "string" || typeof close !== "string" || !HHMM.test(open) || !HHMM.test(close))
      return { error: `${DAY_LABEL[day]}: enter opening and closing times as HH:MM.` };
    if (open === close)
      return { error: `${DAY_LABEL[day]}: opening and closing times can't be the same.` };
    hours[day] = { open, close };
  }
  return { hours };
}
