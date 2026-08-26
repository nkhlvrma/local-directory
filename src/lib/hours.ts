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

// JS getDay(): 0=Sun..6=Sat. Convert to our mon-first array.
function currentDayIn(zone: string): { day: Day; minutes: number } {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
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
  zone = "Asia/Kolkata",
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
