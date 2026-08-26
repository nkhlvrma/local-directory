"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isValidPin } from "@/lib/pin";
import type { WeekHours } from "@/lib/types";

export async function updateListing(patch: {
  id: string;
  name: string;
  description: string | null;
  whatsapp_number: string;
  category_id: string;
  neighborhood_id: string;
  pin_code: string | null;
  photo_url: string | null;
  hours_json: WeekHours | null;
  verified: boolean;
  status: string;
  fields_values: Record<string, string | number | boolean | null> | null;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not signed in" };

  if (!/^\+[1-9][0-9]{7,14}$/.test(patch.whatsapp_number))
    return { error: "WhatsApp must be E.164 (+9198…)" };
  if (patch.pin_code && !isValidPin(patch.pin_code))
    return { error: "PIN must be 6 digits" };

  const { id, ...rest } = patch;
  const { error } = await supabase.from("listings").update(rest).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/admin`);
  revalidatePath(`/admin/listings/${id}/edit`);
  revalidatePath(`/`, "layout");
  return { ok: true };
}
