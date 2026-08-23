"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slug";

export type ImportResult = {
  inserted: number;
  failed: { row: number; error: string }[];
};

// Tab-separated rows: name, category_slug, neighborhood_slug, whatsapp,
// description, verified. Lines can be pasted straight from Google Sheets.
export async function importListings(text: string): Promise<ImportResult> {
  // Admin gate — server action must re-verify.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { inserted: 0, failed: [{ row: 0, error: "not signed in" }] };
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!adminRow)
    return { inserted: 0, failed: [{ row: 0, error: "not an admin" }] };

  const rows = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const admin = createSupabaseAdminClient();
  const [{ data: cats }, { data: hoods }] = await Promise.all([
    admin.from("categories").select("id, slug"),
    admin.from("neighborhoods").select("id, slug"),
  ]);
  const catMap = new Map(
    (cats as { id: string; slug: string }[] | null)?.map((c) => [c.slug, c.id]) ?? [],
  );
  const hoodMap = new Map(
    (hoods as { id: string; slug: string }[] | null)?.map((h) => [h.slug, h.id]) ?? [],
  );

  const result: ImportResult = { inserted: 0, failed: [] };

  for (let i = 0; i < rows.length; i++) {
    const cols = rows[i].split("\t").map((c) => c.trim());
    const [name, categorySlug, neighborhoodSlug, whatsapp, description, verifiedRaw] = cols;

    if (!name || !categorySlug || !neighborhoodSlug || !whatsapp) {
      result.failed.push({ row: i + 1, error: "missing required column" });
      continue;
    }
    if (!/^\+[1-9][0-9]{7,14}$/.test(whatsapp)) {
      result.failed.push({ row: i + 1, error: `bad whatsapp: ${whatsapp}` });
      continue;
    }
    const category_id = catMap.get(categorySlug);
    if (!category_id) {
      result.failed.push({ row: i + 1, error: `unknown category: ${categorySlug}` });
      continue;
    }
    const neighborhood_id = hoodMap.get(neighborhoodSlug);
    if (!neighborhood_id) {
      result.failed.push({ row: i + 1, error: `unknown neighborhood: ${neighborhoodSlug}` });
      continue;
    }

    const verified = /^(true|1|yes|y)$/i.test(verifiedRaw ?? "");
    const base = slugify(name);
    let inserted = false;
    for (let attempt = 0; attempt < 20; attempt++) {
      const slug = attempt === 0 ? base : `${base}-${attempt + 1}`;
      const { error } = await admin.from("listings").insert({
        name,
        slug,
        category_id,
        neighborhood_id,
        description: description || null,
        whatsapp_number: whatsapp,
        verified,
        status: "pending",
        source: "import",
      });
      if (!error) {
        result.inserted++;
        inserted = true;
        break;
      }
      if (!error.message.includes("duplicate")) {
        result.failed.push({ row: i + 1, error: error.message });
        inserted = true; // don't retry
        break;
      }
    }
    if (!inserted)
      result.failed.push({ row: i + 1, error: "could not create unique slug" });
  }
  return result;
}
