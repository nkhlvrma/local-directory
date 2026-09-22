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
    // Worth knowing: a business named only in Devanagari slugs to "", and the
    // caller has to handle that rather than assume a usable slug.
    expect(slugify("मालिश")).toBe("");
  });

  it("keeps digits", () => {
    expect(slugify("Sector 7 Dental")).toBe("sector-7-dental");
  });

  it("can leave a trailing hyphen after truncation", () => {
    // The 60-char slice runs after hyphen-trimming, so a cut landing on a
    // separator leaves one behind. Documented, not asserted as desirable.
    const out = slugify(`${"a".repeat(59)} b`);
    expect(out).toHaveLength(60);
    expect(out.endsWith("-")).toBe(true);
  });
});
