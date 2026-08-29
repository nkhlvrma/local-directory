import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Shared by the public submission flow and the admin "new listing" form.
// Best-effort: caller should treat a null return as "listing still created,
// just photo-less" rather than failing the whole write.
//
// `kind` distinguishes the grid/portrait photo from the cover/landscape one
// when a listing has both — just a storage path prefix, doesn't affect
// anything else. Defaults to "photo" for the original single-photo callers.
export async function uploadListingPhoto(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  listingId: string,
  file: File,
  kind: string = "photo",
): Promise<string | null> {
  const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const path = `${listingId}/${kind}-${Date.now()}.${ext}`;
  const { error } = await admin.storage
    .from("listing-photos")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return null;
  const { data } = admin.storage.from("listing-photos").getPublicUrl(path);
  return data.publicUrl;
}

// Everything uploaded for a listing lives under a {listingId}/ prefix, so
// removing the listing's images is a list-then-remove of that folder.
// Best-effort: a storage failure shouldn't block deleting the listing
// itself, it just leaves files behind.
export async function deleteListingPhotos(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  listingId: string,
): Promise<void> {
  const { data, error } = await admin.storage.from("listing-photos").list(listingId);
  if (error || !data?.length) return;
  await admin.storage
    .from("listing-photos")
    .remove(data.map((f) => `${listingId}/${f.name}`));
}

// Storage path for a public URL produced by uploadListingPhoto, or null if
// the URL doesn't belong to this bucket (e.g. a hand-entered external
// image) — callers use it to avoid trying to delete something we don't own.
export function storagePathFromUrl(url: string): string | null {
  const marker = "/storage/v1/object/public/listing-photos/";
  const i = url.indexOf(marker);
  return i === -1 ? null : url.slice(i + marker.length);
}
