import { describe, it, expect, afterEach, vi } from "vitest";
import { isOpenNow, formatDay } from "../hours";
import type { WeekHours } from "../types";

// isOpenNow resolves "now" in Asia/Kolkata by default, so every case pins the
// clock to a known UTC instant. IST is UTC+5:30 with no DST, which makes the
// arithmetic below stable year-round.
function atIST(day: string, hhmm: string): Date {
  // 2024-01-01 is a Monday; offset from there to reach the wanted weekday.
  const dayIndex = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].indexOf(day);
  const [h, m] = hhmm.split(":").map(Number);
  const utcMinutes = h * 60 + m - (5 * 60 + 30);
  return new Date(Date.UTC(2024, 0, 1 + dayIndex, 0, utcMinutes));
}

afterEach(() => {
  vi.useRealTimers();
});

function at(day: string, hhmm: string) {
  vi.useFakeTimers();
  vi.setSystemTime(atIST(day, hhmm));
}

const NINE_TO_SIX: WeekHours = {
  mon: { open: "09:00", close: "18:00" },
  tue: { open: "09:00", close: "18:00" },
  sun: null,
};

describe("isOpenNow", () => {
  it("returns null when hours are unknown, not false", () => {
    // The UI distinguishes "we don't know" from "closed" — OpenNowBadge
    // renders nothing for null.
    expect(isOpenNow(null)).toBeNull();
  });

  it("is open inside the window", () => {
    at("mon", "12:00");
    expect(isOpenNow(NINE_TO_SIX)).toBe(true);
  });

  it("is open exactly at opening time", () => {
    at("mon", "09:00");
    expect(isOpenNow(NINE_TO_SIX)).toBe(true);
  });

  it("is closed exactly at closing time", () => {
    at("mon", "18:00");
    expect(isOpenNow(NINE_TO_SIX)).toBe(false);
  });

  it("is closed before opening", () => {
    at("mon", "08:59");
    expect(isOpenNow(NINE_TO_SIX)).toBe(false);
  });

  it("is closed on a day explicitly set to null", () => {
    at("sun", "12:00");
    expect(isOpenNow(NINE_TO_SIX)).toBe(false);
  });

  it("is closed on a day missing from the record", () => {
    at("wed", "12:00");
    expect(isOpenNow(NINE_TO_SIX)).toBe(false);
  });

  describe("windows crossing midnight", () => {
    const LATE: WeekHours = { fri: { open: "22:00", close: "02:00" } };

    it("is open late on the opening evening", () => {
      at("fri", "23:30");
      expect(isOpenNow(LATE)).toBe(true);
    });

    it("is open after midnight, read against the new day's entry", () => {
      // 01:00 Friday matches fri's 22:00–02:00 window by the wrap-around
      // branch. Worth pinning: this is the case a naive comparison gets wrong.
      at("fri", "01:00");
      expect(isOpenNow(LATE)).toBe(true);
    });

    it("is closed in the gap between close and open", () => {
      at("fri", "12:00");
      expect(isOpenNow(LATE)).toBe(false);
    });

    it("is closed exactly at the wrap-around close", () => {
      at("fri", "02:00");
      expect(isOpenNow(LATE)).toBe(false);
    });
  });

  it("honours an explicit timezone", () => {
    // 05:00 UTC is 10:30 IST (open) but 05:00 UTC (closed for a 09:00 London
    // opening only in winter — here it's 05:00 GMT, before opening).
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2024, 0, 1, 5, 0)));
    expect(isOpenNow(NINE_TO_SIX, "Asia/Kolkata")).toBe(true);
    expect(isOpenNow(NINE_TO_SIX, "Europe/London")).toBe(false);
  });
});

describe("formatDay", () => {
  it("renders a range", () => {
    expect(formatDay({ open: "09:00", close: "18:00" })).toBe("09:00–18:00");
  });

  it("renders null as Closed", () => {
    expect(formatDay(null)).toBe("Closed");
  });
});
