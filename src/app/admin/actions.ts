"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function decideListing(
  id: string,
  action: "approve" | "reject",
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not authenticated" };

  const patch =
    action === "approve"
      ? {
          status: "approved" as const,
          approved_at: new Date().toISOString(),
          approved_by: (user as { id: string }).id,
        }
      : { status: "rejected" as const };

  const { error } = await supabase.from("listings").update(patch).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function bulkDecide(
  ids: string[],
  action: "approve" | "reject",
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not authenticated" };
  if (ids.length === 0) return { ok: true, count: 0 };

  // No .in() in the mock; loop is fine at admin queue scale.
  let ok = 0;
  for (const id of ids) {
    const patch =
      action === "approve"
        ? {
            status: "approved" as const,
            approved_at: new Date().toISOString(),
            approved_by: (user as { id: string }).id,
          }
        : { status: "rejected" as const };
    const { error } = await supabase.from("listings").update(patch).eq("id", id);
    if (!error) ok++;
  }

  revalidatePath("/admin");
  revalidatePath("/", "layout");
  return { ok: true, count: ok };
}
