"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FieldDef } from "@/lib/types";

export async function saveSchema(id: string, schema: FieldDef[]) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not signed in" };

  // Minimal validation: every field needs key, label, type.
  for (const f of schema) {
    if (!f.key || !f.label || !f.type) {
      return { error: "each field needs key, label, type" };
    }
    if (!["text", "number", "boolean", "select"].includes(f.type)) {
      return { error: `bad type: ${f.type}` };
    }
  }

  const { error } = await supabase
    .from("categories")
    .update({ fields_schema: schema })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  return { ok: true };
}
