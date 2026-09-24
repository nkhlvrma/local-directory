import { describe, it, expect } from "vitest";
import { parseListingFields, validateImage, MAX_PHOTO_BYTES } from "../listing-input";

function form(values: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.set(k, v);
  return fd;
}

const VALID = {
  name: "  Sharma Tailors ",
  whatsapp_number: "+919812345678",
  category_id: "cat",
  neighborhood_id: "hood",
  description: "",
  pin_code: "",
};

describe("parseListingFields", () => {
  it("trims and normalises empty optionals to null", () => {
    expect(parseListingFields(form(VALID))).toEqual({
      fields: {
        name: "Sharma Tailors",
        whatsapp_number: "+919812345678",
        category_id: "cat",
        neighborhood_id: "hood",
        description: null,
        pin_code: null,
      },
    });
  });

  it.each([
    [{ name: "A" }, "Name is required."],
    [{ whatsapp_number: "9812345678" }, "WhatsApp number must be in international format like +9198…"],
    [{ category_id: "" }, "Category and neighborhood are required."],
    [{ pin_code: "12345" }, "PIN code must be 6 digits (e.g. 248001)."],
  ])("rejects %o", (override, error) => {
    expect(parseListingFields(form({ ...VALID, ...override }))).toEqual({ error });
  });
});

describe("validateImage", () => {
  it("accepts a missing or empty file", () => {
    expect(validateImage(null, "Photo")).toBeNull();
    expect(validateImage(new File([], "x.png", { type: "image/png" }), "Photo")).toBeNull();
  });

  it("rejects non-images and oversize files", () => {
    expect(validateImage(new File(["x"], "x.txt", { type: "text/plain" }), "Photo")).toBe(
      "Photo must be an image file.",
    );
    const big = new File([new Uint8Array(MAX_PHOTO_BYTES + 1)], "x.png", { type: "image/png" });
    expect(validateImage(big, "Photo")).toBe("Photo must be under 5MB.");
  });
});
