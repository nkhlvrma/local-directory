import { slugify } from "@/lib/slug";
import type { FieldDef, FieldType } from "@/lib/types";

// Per-category custom fields: an admin defines the schema on the category
// (categories.fields_schema), and each listing in it fills values keyed by
// FieldDef.key (listings.fields_values). The listing page renders whatever
// both sides agree on.

export type FieldValue = string | number | boolean;

const FIELD_TYPES: FieldType[] = ["text", "number", "boolean", "select"];
const MAX_FIELDS = 12;
const MAX_TEXT = 200;

// A key is derived from the label once, when the field is created, and then
// kept even if the label is edited — existing listings' values are stored
// under it.
export function fieldKeyFromLabel(label: string): string {
  return slugify(label).replace(/-/g, "_").slice(0, 40);
}

export function parseFieldsSchemaInput(
  raw: string,
): { fields: FieldDef[] | null; error?: undefined } | { fields?: undefined; error: string } {
  let input: unknown;
  try {
    input = JSON.parse(raw || "[]");
  } catch {
    return { error: "Fields couldn't be read — reload and try again." };
  }
  if (!Array.isArray(input)) return { error: "Fields couldn't be read — reload and try again." };
  if (input.length > MAX_FIELDS) return { error: `A category can have at most ${MAX_FIELDS} fields.` };

  const out: FieldDef[] = [];
  const keys = new Set<string>();
  for (const [i, item] of input.entries()) {
    const f = (item ?? {}) as Record<string, unknown>;
    const label = typeof f.label === "string" ? f.label.trim() : "";
    if (!label) return { error: `Field ${i + 1} needs a label.` };
    const key =
      typeof f.key === "string" && /^[a-z0-9_]+$/.test(f.key) ? f.key : fieldKeyFromLabel(label);
    if (!key) return { error: `"${label}": use at least one letter or digit in the label.` };
    if (keys.has(key)) return { error: `"${label}" duplicates another field — rename one of them.` };
    keys.add(key);

    const type = f.type as FieldType;
    if (!FIELD_TYPES.includes(type)) return { error: `"${label}": choose a field type.` };

    const def: FieldDef = { key, label, type };
    if (type === "select") {
      const options = Array.isArray(f.options)
        ? [...new Set(f.options.map((o) => String(o).trim()).filter(Boolean))]
        : [];
      if (options.length < 2) return { error: `"${label}": a choice field needs at least two options.` };
      def.options = options;
    }
    const help = typeof f.help === "string" ? f.help.trim() : "";
    if (help) def.help = help;
    out.push(def);
  }
  return { fields: out.length ? out : null };
}

// Coerces a listing's submitted values against its category's schema. Keys
// not in the schema are dropped, and empty values are omitted rather than
// stored, so the listing page's "only show filled fields" rule holds.
export function parseFieldValuesInput(
  schema: FieldDef[] | null,
  raw: string,
):
  | { values: Record<string, FieldValue> | null; error?: undefined }
  | { values?: undefined; error: string } {
  if (!schema?.length || !raw.trim()) return { values: null };
  let input: unknown;
  try {
    input = JSON.parse(raw);
  } catch {
    return { error: "Category details couldn't be read — reload and try again." };
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) return { values: null };

  const values: Record<string, FieldValue> = {};
  for (const f of schema) {
    const v = (input as Record<string, unknown>)[f.key];
    if (v === undefined || v === null || v === "") continue;
    switch (f.type) {
      case "text": {
        const s = String(v).trim().slice(0, MAX_TEXT);
        if (s) values[f.key] = s;
        break;
      }
      case "number": {
        const n = typeof v === "number" ? v : Number(String(v).trim());
        if (!Number.isFinite(n)) return { error: `${f.label} must be a number.` };
        values[f.key] = n;
        break;
      }
      case "boolean":
        values[f.key] = v === true || v === "true";
        break;
      case "select": {
        const s = String(v);
        if (!f.options?.includes(s)) return { error: `${f.label}: pick one of the listed options.` };
        values[f.key] = s;
        break;
      }
    }
  }
  return { values: Object.keys(values).length ? values : null };
}
