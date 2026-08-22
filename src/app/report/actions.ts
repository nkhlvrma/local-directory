"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function submitReport(fd: FormData) {
  const listing_id = String(fd.get("listing_id") ?? "");
  const reason = String(fd.get("reason") ?? "");
  const note = String(fd.get("note") ?? "").trim() || null;
  if (!listing_id || !reason) return { error: "Missing fields" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("listing_reports")
    .insert({ listing_id, reason, note });
  if (error) return { error: error.message };
  return { ok: true };
}
