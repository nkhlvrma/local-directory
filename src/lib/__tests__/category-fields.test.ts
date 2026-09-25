import { describe, it, expect } from "vitest";
import { parseFieldsSchemaInput, parseFieldValuesInput } from "../category-fields";
import type { FieldDef } from "../types";

describe("parseFieldsSchemaInput", () => {
  it("derives keys from labels and keeps an existing key when the label changes", () => {
    const { fields } = parseFieldsSchemaInput(
      JSON.stringify([
        { label: "Price per meal", type: "number" },
        { key: "diet", label: "Food type", type: "select", options: ["Veg", "Non-veg", "Veg"] },
      ]),
    );
    expect(fields).toEqual([
      { key: "price_per_meal", label: "Price per meal", type: "number" },
      { key: "diet", label: "Food type", type: "select", options: ["Veg", "Non-veg"] },
    ]);
  });

  it("stores an empty list as null", () => {
    expect(parseFieldsSchemaInput("[]")).toEqual({ fields: null });
  });

  it.each([
    [[{ label: "", type: "text" }], "Field 1 needs a label."],
    [[{ label: "Size", type: "colour" }], '"Size": choose a field type.'],
    [[{ label: "Diet", type: "select", options: ["Veg"] }], '"Diet": a choice field needs at least two options.'],
    [
      [
        { label: "Area", type: "text" },
        { label: "area", type: "number" },
      ],
      '"area" duplicates another field — rename one of them.',
    ],
  ])("rejects %o", (input, error) => {
    expect(parseFieldsSchemaInput(JSON.stringify(input))).toEqual({ error });
  });
});

describe("parseFieldValuesInput", () => {
  const schema: FieldDef[] = [
    { key: "diet", label: "Diet", type: "select", options: ["Veg", "Both"] },
    { key: "price", label: "Price", type: "number" },
    { key: "delivery", label: "Delivery", type: "boolean" },
    { key: "note", label: "Note", type: "text" },
  ];

  it("coerces by type, drops empty values and unknown keys", () => {
    const { values } = parseFieldValuesInput(
      schema,
      JSON.stringify({ diet: "Veg", price: "90", delivery: false, note: "  ", extra: "x" }),
    );
    expect(values).toEqual({ diet: "Veg", price: 90, delivery: false });
  });

  it("returns null when nothing is filled or the category has no fields", () => {
    expect(parseFieldValuesInput(schema, "{}")).toEqual({ values: null });
    expect(parseFieldValuesInput(null, JSON.stringify({ diet: "Veg" }))).toEqual({ values: null });
  });

  it("rejects a non-number and an option outside the list", () => {
    expect(parseFieldValuesInput(schema, JSON.stringify({ price: "ninety" }))).toEqual({
      error: "Price must be a number.",
    });
    expect(parseFieldValuesInput(schema, JSON.stringify({ diet: "Jain" }))).toEqual({
      error: "Diet: pick one of the listed options.",
    });
  });
});
