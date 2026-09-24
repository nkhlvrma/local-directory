import type { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type DuplicateHit = { id: string; name: string };

// The listing already using this WhatsApp number, if any — every write path
// refuses a second listing on the same number. `excludeId` skips the listing
// being edited, so re-saving an unchanged number isn't flagged as a duplicate
// of itself.
//
// This used to be a single or() that also fuzzy-matched on name, with the name
// pasted into the filter string. A name containing a comma broke the filter,
// the error was ignored, and the number check was silently skipped. Nothing
// used the name matches, so it's now a plain equality lookup.
export async function findListingByWhatsapp(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  whatsapp: string,
  excludeId?: string,
): Promise<{ hit: DuplicateHit | null; error: string | null }> {
  let query = admin
    .from("listings")
    .select("id, name")
    .eq("whatsapp_number", whatsapp);
  if (excludeId) query = query.neq("id", excludeId);
  const { data, error } = await query.limit(1);
  if (error) return { hit: null, error: error.message };
  return { hit: ((data ?? [])[0] as DuplicateHit | undefined) ?? null, error: null };
}
