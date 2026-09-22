import { describe, it, expect } from "vitest";
import { isValidPin } from "../pin";

// Indian PIN codes are exactly six digits and never start with 0. This gate
// guards both the cookie filter and the listing form, so the negative cases
// matter as much as the positive one.
describe("isValidPin", () => {
  it("accepts a well-formed PIN", () => {
    expect(isValidPin("226030")).toBe(true);
  });

  it("rejects a leading zero", () => {
    expect(isValidPin("026030")).toBe(false);
  });

  it.each(["22603", "2260301", "", "abcdef", "22603a", "226 030", " 226030"])(
    "rejects %o",
    (input) => {
      expect(isValidPin(input)).toBe(false);
    },
  );

  it("rejects a value with a trailing newline", () => {
    // A bare /\d{6}$/ would pass this, since $ matches before a final newline.
    expect(isValidPin("226030\n")).toBe(false);
  });
});
