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

  // RLS enforces admin-only writes; this call fails cleanly if the user is not
  // in admin_users.
  const patch =
    action === "approve"
      ? {
          status: "approved" as const,
          approved_at: new Date().toISOString(),
          approved_by: user.id,
        }
      : { status: "rejected" as const };

  const { error } = await supabase.from("listings").update(patch).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/", "layout");
  return { ok: true };
}
