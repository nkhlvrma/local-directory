"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slug";
import type { Lead } from "./page";

export type AddResult = {
  inserted: Lead[];
  failed: { row: number; error: string }[];
};

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "not signed in" };
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!adminRow) return { ok: false as const, error: "not an admin" };
  return { ok: true as const, userId: user.id };
}

const LEAD_SELECT = `id, business_name, whatsapp_number, source_note, status,
  contacted_at, replied_at, listing_id, created_at,
  categories ( id, slug, name ),
  neighborhoods ( id, slug, name )`;

export async function addLeads(text: string): Promise<AddResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return { inserted: [], failed: [{ row: 0, error: gate.error }] };

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

  const rows = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const result: AddResult = { inserted: [], failed: [] };

  for (let i = 0; i < rows.length; i++) {
    const cols = rows[i].split("\t").map((c) => c.trim());
    const [name, whatsapp, categorySlug, neighborhoodSlug, note] = cols;

    if (!name || !whatsapp) {
      result.failed.push({ row: i + 1, error: "missing name or whatsapp" });
      continue;
    }
    if (!/^\+[1-9][0-9]{7,14}$/.test(whatsapp)) {
      result.failed.push({ row: i + 1, error: `bad whatsapp: ${whatsapp}` });
      continue;
    }
    const category_id = categorySlug ? catMap.get(categorySlug) ?? null : null;
    const neighborhood_id = neighborhoodSlug
      ? hoodMap.get(neighborhoodSlug) ?? null
      : null;
    if (categorySlug && !category_id) {
      result.failed.push({ row: i + 1, error: `unknown category: ${categorySlug}` });
      continue;
    }
    if (neighborhoodSlug && !neighborhood_id) {
      result.failed.push({
        row: i + 1,
        error: `unknown neighborhood: ${neighborhoodSlug}`,
      });
      continue;
    }

    const { data, error } = await admin
      .from("outreach_leads")
      .insert({
        business_name: name,
        whatsapp_number: whatsapp,
        category_id,
        neighborhood_id,
        source_note: note || null,
      })
      .select(LEAD_SELECT)
      .maybeSingle();

    if (error) {
      result.failed.push({ row: i + 1, error: error.message });
    } else if (data) {
      result.inserted.push(data as unknown as Lead);
    }
  }
  return result;
}

export async function updateLeadStatus(
  id: string,
  status: Lead["status"],
): Promise<Lead | null> {
  const gate = await requireAdmin();
  if (!gate.ok) return null;

  const patch: Record<string, unknown> = { status };
  const now = new Date().toISOString();
  if (status === "contacted") patch.contacted_at = now;
  if (status === "yes" || status === "no") patch.replied_at = now;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("outreach_leads")
    .update(patch)
    .eq("id", id)
    .select(LEAD_SELECT)
    .maybeSingle();
  if (error) return null;
  return (data as unknown as Lead) ?? null;
}

// Yes reply → create a listing (pending, verified=true because they explicitly
// consented via WhatsApp) and link it back to the lead. The admin still
// approves it via /admin as a final sanity check.
export async function convertLeadToListing(id: string): Promise<Lead | null> {
  const gate = await requireAdmin();
  if (!gate.ok) return null;

  const admin = createSupabaseAdminClient();
  const { data: leadRaw } = await admin
    .from("outreach_leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const lead = leadRaw as {
    id: string;
    business_name: string;
    whatsapp_number: string;
    category_id: string | null;
    neighborhood_id: string | null;
  } | null;
  if (!lead) return null;
  if (!lead.category_id || !lead.neighborhood_id) return null;

  const base = slugify(lead.business_name);
  let listingId: string | null = null;
  for (let attempt = 0; attempt < 20; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const { data, error } = await admin
      .from("listings")
      .insert({
        name: lead.business_name,
        slug,
        category_id: lead.category_id,
        neighborhood_id: lead.neighborhood_id,
        whatsapp_number: lead.whatsapp_number,
        verified: true,
        status: "pending",
        source: "manual",
      })
      .select("id")
      .maybeSingle();
    if (!error && data) {
      listingId = (data as { id: string }).id;
      break;
    }
    if (error && !error.message.includes("duplicate")) return null;
  }
  if (!listingId) return null;

  const { data: updated } = await admin
    .from("outreach_leads")
    .update({
      status: "yes",
      replied_at: new Date().toISOString(),
      listing_id: listingId,
    })
    .eq("id", id)
    .select(LEAD_SELECT)
    .maybeSingle();
  return (updated as unknown as Lead) ?? null;
}
