import { describe, expect, it } from "vitest";
import { pickCategoryIcon } from "../category-icon-picker";
import { CATEGORY_ICONS, CATEGORY_ICON_NAMES } from "../category-icons";

// The picker writes an icon name into the database; CategoryIcon has to be
// able to draw it. Keeping the two in sync is what stops a category from
// silently rendering as a fallback dot.
describe("category icons", () => {
  const names = [
    "Tiffin Services", "Plumbers", "Dentists", "Yoga Studios",
    "Pet Grooming", "Chartered Accountants", "Something Unheard Of",
  ];

  it.each(names)("picks a drawable icon for %s", (name) => {
    const icon = pickCategoryIcon(name);
    expect(CATEGORY_ICON_NAMES.has(icon)).toBe(true);
    expect(CATEGORY_ICONS[icon]).toBeTruthy();
  });

  it("falls back to the storefront icon when nothing matches", () => {
    expect(pickCategoryIcon("Something Unheard Of")).toBe("store");
  });

  it("has no entry for an emoji icon value", () => {
    expect(CATEGORY_ICONS["🧹"]).toBeUndefined();
  });
});
