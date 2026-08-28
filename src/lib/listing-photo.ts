import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Shared by the public submission flow and the admin "new listing" form.
// Best-effort: caller should treat a null return as "listing still created,
// just photo-less" rather than failing the whole write.
export async function uploadListingPhoto(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  listingId: string,
  file: File,
): Promise<string | null> {
  const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const path = `${listingId}/${Date.now()}.${ext}`;
  const { error } = await admin.storage
    .from("listing-photos")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return null;
  const { data } = admin.storage.from("listing-photos").getPublicUrl(path);
  return data.publicUrl;
}
