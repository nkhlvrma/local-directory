import { describe, it, expect } from "vitest";
import { ilikeAnyFilter } from "../postgrest";

describe("ilikeAnyFilter", () => {
  it("quotes each value so commas and parentheses stay literal", () => {
    // Unquoted, the comma split the or() and PostgREST rejected the filter.
    expect(ilikeAnyFilter(["name", "description"], "tailor, dalanwala (east)")).toBe(
      'name.ilike."%tailor, dalanwala (east)%",description.ilike."%tailor, dalanwala (east)%"',
    );
  });

  it("escapes LIKE wildcards, then escapes backslashes for the quoted value", () => {
    expect(ilikeAnyFilter(["name"], "50%_off")).toBe('name.ilike."%50\\\\%\\\\_off%"');
  });

  it("escapes double quotes inside the value", () => {
    expect(ilikeAnyFilter(["name"], 'say "hi"')).toBe('name.ilike."%say \\"hi\\"%"');
  });
});
