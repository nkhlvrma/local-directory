import { describe, it, expect } from "vitest";
import { slugify } from "../slug";

// Slugs end up in listing URLs, so they need to stay stable and URL-safe.
describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Tender Massages Test")).toBe("tender-massages-test");
  });

  it("strips punctuation", () => {
    expect(slugify("Ravi's Café & Co.")).toBe("ravis-caf-co");
  });

  it("collapses runs of whitespace and hyphens", () => {
    expect(slugify("A   B---C")).toBe("a-b-c");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  --hello--  ")).toBe("hello");
  });

  it("caps length at 60 characters", () => {
    expect(slugify("a".repeat(100))).toHaveLength(60);
  });

  it("returns an empty string when nothing survives", () => {
    // A business named only in Devanagari slugs to "" — callers handle it
    // (insertListingWithUniqueSlug falls back to "listing").
    expect(slugify("मालिश")).toBe("");
  });

  it("keeps digits", () => {
    expect(slugify("Sector 7 Dental")).toBe("sector-7-dental");
  });

  it("doesn't leave a trailing hyphen when truncation lands on a separator", () => {
    expect(slugify(`${"a".repeat(59)} b`)).toBe("a".repeat(59));
  });
});
