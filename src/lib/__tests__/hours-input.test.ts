import { describe, it, expect } from "vitest";
import { parseHoursInput } from "../hours";

describe("parseHoursInput", () => {
  it("treats an empty payload as hours not set", () => {
    expect(parseHoursInput("")).toEqual({ hours: null });
  });

  it("fills unlisted days as closed", () => {
    const { hours } = parseHoursInput(JSON.stringify({ mon: { open: "09:00", close: "18:00" } }));
    expect(hours).toEqual({
      mon: { open: "09:00", close: "18:00" },
      tue: null, wed: null, thu: null, fri: null, sat: null, sun: null,
    });
  });

  it("accepts windows that cross midnight", () => {
    const { hours } = parseHoursInput(JSON.stringify({ fri: { open: "18:00", close: "02:00" } }));
    expect(hours?.fri).toEqual({ open: "18:00", close: "02:00" });
  });

  it.each([
    [{ mon: { open: "9:00", close: "18:00" } }, "Mon: enter opening and closing times as HH:MM."],
    [{ tue: { open: "24:00", close: "18:00" } }, "Tue: enter opening and closing times as HH:MM."],
    [{ wed: { open: "10:00" } }, "Wed: enter opening and closing times as HH:MM."],
    [{ sun: { open: "10:00", close: "10:00" } }, "Sun: opening and closing times can't be the same."],
  ])("rejects %o", (input, error) => {
    expect(parseHoursInput(JSON.stringify(input))).toEqual({ error });
  });

  it("rejects malformed JSON and non-objects", () => {
    expect(parseHoursInput("{").error).toBeDefined();
    expect(parseHoursInput("[]").error).toBeDefined();
  });
});
