import type { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isValidPin } from "@/lib/pin";
import { slugify } from "@/lib/slug";

// Parsing and validation shared by every listing write path — the public
// submission form, and the admin create and edit forms. They used to each
// carry their own copy of these rules.

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

// Postgres error codes, matched on the code rather than the message text.
export const UNIQUE_VIOLATION = "23505";
export const FOREIGN_KEY_VIOLATION = "23503";

export type ListingFields = {
  name: string;
  whatsapp_number: string;
  category_id: string;
  neighborhood_id: string;
  description: string | null;
  pin_code: string | null;
};

export function parseListingFields(
  fd: FormData,
): { fields: ListingFields; error?: undefined } | { fields?: undefined; error: string } {
  const name = String(fd.get("name") ?? "").trim();
  const whatsapp = String(fd.get("whatsapp_number") ?? "").trim();
  const categoryId = String(fd.get("category_id") ?? "");
  const neighborhoodId = String(fd.get("neighborhood_id") ?? "");
  const description = String(fd.get("description") ?? "").trim() || null;
  const pin = String(fd.get("pin_code") ?? "").trim();

  if (name.length < 2) return { error: "Name is required." };
  if (!/^\+[1-9][0-9]{7,14}$/.test(whatsapp))
    return { error: "WhatsApp number must be in international format like +9198…" };
  if (!categoryId || !neighborhoodId)
    return { error: "Category and neighborhood are required." };
  if (pin && !isValidPin(pin))
    return { error: "PIN code must be 6 digits (e.g. 248001)." };

  return {
    fields: {
      name,
      whatsapp_number: whatsapp,
      category_id: categoryId,
      neighborhood_id: neighborhoodId,
      description,
      pin_code: pin || null,
    },
  };
}

// Returns an error string, or null when the file is absent or acceptable.
export function validateImage(file: unknown, label: string): string | null {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!file.type.startsWith("image/")) return `${label} must be an image file.`;
  if (file.size > MAX_PHOTO_BYTES) return `${label} must be under 5MB.`;
  return null;
}

// Inserts a listing under the first free slug (name, name-2, name-3, …) in its
// neighborhood. A name with no Latin letters or digits — common for businesses
// named in Devanagari — slugifies to "", so it falls back to "listing" rather
// than producing an empty URL segment.
export async function insertListingWithUniqueSlug(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  row: ListingFields & Record<string, unknown>,
): Promise<{ id: string; error?: undefined } | { id?: undefined; error: string }> {
  const base = slugify(row.name) || "listing";
  for (let i = 0; i < 20; i++) {
    const slug = i === 0 ? base : `${base}-${i + 1}`;
    const { data, error } = await admin
      .from("listings")
      .insert({ ...row, slug })
      .select("id")
      .single();
    if (!error) return { id: (data as { id: string }).id };
    if (error.code !== UNIQUE_VIOLATION) return { error: error.message };
  }
  return { error: "Could not create a unique slug — try a different name." };
}
